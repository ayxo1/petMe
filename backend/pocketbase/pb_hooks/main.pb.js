/// <reference path="../pb_data/types.d.ts" />

//pet-feed endpoint
routerAdd("GET", "/api/feed", (c) => {  
    
    const user = c.auth;
    let userCoords = null;
    try {
        const currentUser = new DynamicModel({ coordinates: '' });
        $app.db().newQuery(
            `SELECT coordinates FROM users WHERE id = {:userId}`
        ).bind({ userId: user.id }).one(currentUser);

        userCoords = JSON.parse(currentUser.coordinates);
    } catch (error) {
        console.log('currentUser.coordinates error: ', error);
    }

    const toRad = deg => deg * (Math.PI / 180);
    const haversine = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c);
    };

    let page = 1;
    let perPage = 20;
    let rawTypes = 'pets';

    try {
        const rawQuery = (c.request && c.request.url && c.request.url.rawQuery) || "";

        const typeMatch = rawQuery.match(/type=([^&]+)/);
        if (typeMatch) rawTypes = decodeURIComponent(typeMatch[1]);

        const pageMatch = rawQuery.match(/[?&]page=(\d+)/);
        if (pageMatch) page = parseInt(pageMatch[1]);

        const perPageMatch = rawQuery.match(/[?&]perPage=(\d+)/);
        if (perPageMatch) perPage = parseInt(perPageMatch[1]);

    } catch (e) {
        console.log("api/feed: Query parse error, using defaults:", e);
    }

    const types = rawTypes.split(',');
    const limit = perPage;
    const offset = (page - 1) * perPage;

    let adoptionStatuses = [];
    if (types.includes('pets')) adoptionStatuses.push('false');
    if (types.includes('rescue')) adoptionStatuses.push('true');
    if (adoptionStatuses.length === 0) adoptionStatuses = ['true', 'false'];
    const adoptionFilter = `isAvailableForAdoption IN (${adoptionStatuses.join(',')})`;

    let queries = [];
    let bindParams = { userId: user.id, limit, offset };

    if (types.includes('pets') || types.includes('rescue')) {
    queries.push(`
        SELECT 
            id, 
            name, 
            bio, 
            images, 
            'pet' as type, 
            owner as ownerId,
            age, 
            created,
            (SELECT username FROM users WHERE id = pets.owner) as ownerName,
            (SELECT images FROM users WHERE id = pets.owner) as ownerImage,
            (SELECT coordinates FROM users WHERE id = pets.owner) as ownerCoordinates
        FROM pets
        WHERE owner != {:userId} 
            AND ${adoptionFilter}
            AND id NOT IN (SELECT targetPet FROM swipes WHERE user = {:userId} AND swipeType = 'pet')
            AND owner NOT IN (SELECT user2 FROM matches WHERE user1 = {:userId} AND status = 'active')
            AND owner NOT IN (SELECT user1 FROM matches WHERE user2 = {:userId} AND status = 'active')
        `);
    }

    let accountPatterns = [];
    if (types.includes('seekers')) accountPatterns.push('seeker');
    if (types.includes('shelters')) accountPatterns.push('shelter');

    const accountFilter = accountPatterns.length > 0
        ? accountPatterns.map(pattern => `accountType LIKE '%${pattern}%'`).join(' OR ') 
        : '1=1';

    if (types.includes('users') || types.includes('seekers')) {
        queries.push(`
            SELECT id, 
            username as name, 
            bio, 
            images, 
            'profile' as type, 
            id as ownerId, 
            0 as age, 
            created,
            username as ownerName,
            images as ownerImage,
            coordinates as ownerCoordinates
            
            FROM users
            WHERE id != {:userId}
                -- AND isHidden = FALSE
                AND (${accountFilter})
                AND id NOT IN (SELECT targetUser FROM swipes WHERE user = {:userId} AND swipeType = 'profile')
                AND id NOT IN (SELECT user2 FROM matches WHERE user1 = {:userId} AND status = 'active')
                AND id NOT IN (SELECT user1 FROM matches WHERE user2 = {:userId} AND status = 'active')
        `);
    }

    const finalQuery = `
        ${queries.join(' UNION ')}
        ORDER BY created DESC
        LIMIT {:limit} OFFSET {:offset}
    `;

    const result = arrayOf(new DynamicModel({
        'id': '',
        'name': '',
        'bio': '',
        'images': [],
        'type': '',
        'ownerName': '',
        'ownerImage': '',
        'ownerId': '',
        'ownerCoordinates': '',
        'age': 0,
        'created': ''
    }));

    if (queries.length > 0) {
        $app.db().newQuery(finalQuery).bind(bindParams).all(result);
    }

    const profilesWithDistance = result.map(profile => {
        
        if (!userCoords || !profile.ownerCoordinates) return { ...profile, distance: null }

        try {
            const otherCoords = JSON.parse(profile.ownerCoordinates);
            const distance = haversine(userCoords.lat, userCoords.lng, otherCoords.lat, otherCoords.lng);
            return { ...profile, distance: `${distance} km`};
        } catch (error) {
            console.log('profilesWithDistance error, returning distance as null: ', error);
            return { ...profile, distance: null };
        }
    });

    return c.json(200, {
        "items": profilesWithDistance,
        "page": page,
        "perPage": perPage
    });
}, $apis.requireAuth('users'));

// matching endpoint
routerAdd("POST", "/api/swipe", (c) => {
    const user = c.auth;
    
    const data = new DynamicModel({
        'targetId': '',
        'action': ''
    });
    c.bindBody(data);

    const { targetId } = data;
    const action = data.action; // 'like | pass'

    let swipeType = 'pet';
    let petOwnerId = '';

    try {
        const pet = $app.findRecordById('pets', targetId);
        petOwnerId = pet.get('owner');
        swipeType = 'pet';
    } catch (error) {
        // not found = it's a swipe on seeker's profile
        petOwnerId = targetId;
        swipeType = 'profile';
    }

    const swipes = $app.findCollectionByNameOrId('swipes');
    const record = new Record(swipes);
    record.set('user', user.id);
    if (swipeType === 'profile') {
        record.set('targetUser', targetId);
    } else record.set('targetPet', targetId)
    record.set('action', action);
    record.set('swipeType', swipeType);
    record.set('targetOwnerId', petOwnerId);

    $app.save(record);

    if(action != 'like') return c.json(200, { isMatch: false });

    // check mutual likes
    try {
        const myPets = $app.findRecordsByFilter(
            'pets', 
            'owner = {:id}',
            '-created',
            100,
            0,
            { id: user.id }
        );
        
        const myPetIds = myPets.map(pet => pet.id);

        let orConditions = [`targetUser = '${user.id}'`];
        if (myPetIds.length > 0) {
            const petCondition = myPetIds.map(id => `targetPet = '${id}'`).join(' || ');
            orConditions.push(petCondition);
        }

        const targetCheck = "(" + orConditions.join(" || ") + ")";        

        const filter = `user = {:otherUser} && action = 'like' && ${targetCheck}`;

        const mutualLikes = $app.findRecordsByFilter(
            'swipes', 
            filter, 
            '-created',
            1,
            0,
            {
                otherUser: petOwnerId,
                myId: user.id
            }
        );

        if (mutualLikes.length > 0) {

            try {
                const existingMatches = $app.findRecordsByFilter(
                    'matches',
                    `((user1 = {:myId} && user2 = {:otherId}) || (user1 = {:otherId} && user2 = {:myId})) && status!='unmatched'`,
                    '-created',
                    1,
                    0,
                    { 
                        myId: user.id,
                        otherId: petOwnerId
                    }
                );

                if(existingMatches.length > 0) {
                    const existingMatch = existingMatches[0].id;

                    return c.json(200, {
                        isMatch: true,
                        matchId: existingMatch,
                        isExisting: true
                    });
                }
                throw new Error("No existing match found");

            } catch (error) {

                console.log(`existingMatch not found / ERROR: ${error}`);

                const otherUserSwipe = mutualLikes[0];
                const otherSwipedPet = otherUserSwipe.getString('targetPet') || '';
                const mySwipedPet = (swipeType === 'pet') ? targetId : '';
                
                const matches = $app.findCollectionByNameOrId('matches');
                const match = new Record(matches);
                match.set('user1', user.id);
                match.set('user2', petOwnerId);
                match.set('pet1', otherSwipedPet);
                match.set('pet2', mySwipedPet);
                match.set('status', 'active');
    
                $app.save(match);
    
                return c.json(200, { 
                    isMatch: true, 
                    matchId: match.id,
                    isExisting: false
                });
            }

        }
    } catch (error) {
        console.error('match check error, swipes endpoint', error);
    }

    return c.json(200, { isMatch: false });
}, $apis.requireAuth('users'));

routerAdd("POST", "/api/unmatch", (c) => {
    const data = new DynamicModel({
        'matchId': '',
    });
    c.bindBody(data);    

    const { matchId } = data;

    try {
        const match = $app.findRecordById('matches', matchId);        
    
        match.set('status', 'unmatched');
    
        $app.save(match);
    } catch (error) {
        console.log('api/unmatch error:', error);   
    }

    
    return c.json(200, { "unmatchedUser": matchId });


}, $apis.requireAuth('users'));

routerAdd("GET", "/api/likes", (c) => {
    const user = c.auth;
    let page = 1;
    let perPage = 20;
    const limit = perPage;
    const offset = (page - 1) * perPage;

    try {
        const rawQuery = (c.request && c.request.url && c.request.url.rawQuery) || "";

        const pageMatch = rawQuery.match(/[?&]page=(\d+)/);
        if (pageMatch) page = parseInt(pageMatch[1]);

        const perPageMatch = rawQuery.match(/[?&]perPage=(\d+)/);
        if (perPageMatch) perPage = parseInt(perPageMatch[1]);

    } catch (e) {
        console.log("api/likes: Query parse error, using defaults:", e);
    }

    const query = `
        SELECT 
            u.id, 
            u.username as name, 
            u.bio, 
            u.images, 
            u.accountType as type,

            (CASE 
                WHEN s.swipeType = 'pet' THEN s.targetPet
                ELSE s.targetUser
            END) as likedTarget,

            s.swipeType as likedTargetType,

            (CASE
                WHEN s.swipeType = 'pet' THEN (SELECT name FROM pets WHERE id = s.targetPet)
                ELSE (SELECT username FROM users WHERE id = s.targetUser)
            END) as likedTargetName,
            
            MAX(s.created) as created

        FROM swipes s
        JOIN users u ON u.id = s.user
        WHERE
            s.action = 'like'
            AND s.user != {:userId}
            AND s.targetOwnerId = {:userId}
            AND s.user NOT IN (SELECT user2 FROM matches WHERE user1={:userId})
            AND s.user NOT IN (SELECT user1 FROM matches WHERE user2={:userId})
            AND u.id NOT IN (SELECT targetUser FROM swipes WHERE user = {:userId} AND action = 'pass')
        GROUP BY u.id
        ORDER BY s.created DESC
        LIMIT {:limit} OFFSET {:offset}
    `;

    const result = arrayOf(new DynamicModel({
        'id': '',
        'name': '',
        'bio': '',
        'images': [],
        'type': '',
        'likedTarget': '',
        'likedTargetType': '',
        'likedTargetName': '',
        'created': ''
    }));

    $app.db().newQuery(query).bind({ 
        userId: user.id,
        limit,
        offset
    }).all(result);

    return c.json(200, {
        'items': result,
        'page': page,
        'perPage': perPage
    });

}, $apis.requireAuth('users'));