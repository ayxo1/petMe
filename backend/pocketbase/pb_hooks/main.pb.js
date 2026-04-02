/// <reference path="../pb_data/types.d.ts" />

onRecordViewRequest((e) => {
    if (e.record.id !== e.requestInfo?.auth?.id) {
        e.record.set('coordinates', null);
    }
}, 'users, superusers');

onRecordAfterCreateSuccess((e) => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    e.record.set('verificationPin', pin);
    e.record.set('pinExpiresAt', expiresAt);
    $app.save(e.record);

    try {
        const mailClient = $app.newMailClient();
        const message = new MailerMessage({
            from: { address: 'petapetsupport@gmail.com', name: 'pet-a-pet app'},
            to: [{ address: e.record.get('email') }],
            subject: 'your pet-a-pet verification code',
            html: `your code is: <strong>${pin}</strong>`
        });
    
        mailClient.send(message);
    } catch (error) {
        console.log('onRecordAfterCreateSuccess, mail sending error:', error);
        // set regStatus as verified anyways to later let user verify the mail manually in profile settings
        e.record.set('regState', 'verified');
        $app.save(e.record);
    }
}, 'users');

//pet-feed endpoint
routerAdd("GET", "/api/feed", (c) => {
    
    const user = c.auth;
    const userPreferences = JSON.parse(user.get('preferences'));
    let userCoords = null;
    try {
        const currentUser = new DynamicModel({ coordinates: '' });
        $app.db().newQuery(
            `SELECT COALESCE(coordinates, '') as coordinates FROM users WHERE id = {:userId}`
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

    try {
        const rawQuery = (c.request && c.request.url && c.request.url.rawQuery) || "";

        const pageMatch = rawQuery.match(/[?&]page=(\d+)/);
        if (pageMatch) page = parseInt(pageMatch[1]);

        const perPageMatch = rawQuery.match(/[?&]perPage=(\d+)/);
        if (perPageMatch) perPage = parseInt(perPageMatch[1]);

    } catch (e) {
        console.log("api/feed: Query parse error, using defaults:", e);
    }

    const limit = perPage;
    const offset = (page - 1) * perPage;

    const rescueFilter = !userPreferences.showRescuePets ? 'AND isAvailableForAdoption = false' : '';
    const shelterFilter = !userPreferences.showShelterPets ? "AND (SELECT accountType FROM users WHERE id = pets.owner) NOT LIKE '%shelter%'" : '';
    const speciesFilter = userPreferences.preferredSpecies.length > 0
        ? `AND species IN (${userPreferences.preferredSpecies.map(species => `'${species}'`).join(',')})`
        : '';

    let queries = [];
    let bindParams = { userId: user.id, limit, offset };
    queries.push(`
        SELECT 
            id, 
            name, 
            bio, 
            images,
            breed,
            isAvailableForAdoption,
            adoptionStatus,
            adoptionRequirements,
            adoptionReason,
            'pet' as type,
            owner as ownerId,
            age,
            created,
            (SELECT username FROM users WHERE id = pets.owner) as ownerName,
            (SELECT images FROM users WHERE id = pets.owner) as ownerImage,
            (SELECT coordinates FROM users WHERE id = pets.owner) as ownerCoordinates
        FROM pets
        WHERE owner != {:userId} 
            ${rescueFilter}
            ${shelterFilter}
            ${speciesFilter}
            AND id NOT IN (SELECT targetPet FROM swipes WHERE user = {:userId} AND swipeType = 'pet')
            AND owner NOT IN (SELECT user2 FROM matches WHERE user1 = {:userId} AND status = 'active')
            AND owner NOT IN (SELECT user1 FROM matches WHERE user2 = {:userId} AND status = 'active')
            AND (SELECT accountType FROM users WHERE id = pets.owner) NOT LIKE '%seeker%'
    `);

    if (userPreferences.showSeekers) {
        queries.push(`
            SELECT id, 
            username as name, 
            bio, 
            images,
            '' as breed,
            0 as isAvailableForAdoption,
            0 as adoptionStatus,
            0 as adoptionRequirements,
            0 as adoptionReason,
            accountType as type, 
            id as ownerId,
            0 as age,
            created,
            username as ownerName,
            images as ownerImage,
            coordinates as ownerCoordinates
            
            FROM users
            WHERE id != {:userId}
                AND accountType LIKE '%seeker%'
                -- AND isHidden = FALSE
                AND id NOT IN (SELECT targetUser FROM swipes WHERE user = {:userId} AND swipeType = 'profile')
                AND id NOT IN (SELECT user2 FROM matches WHERE user1 = {:userId} AND status = 'active')
                AND id NOT IN (SELECT user1 FROM matches WHERE user2 = {:userId} AND status = 'active')
        `);
    }

    const finalQuery = `
        SELECT * FROM (
            ${queries.join(' UNION ')}
        )
        ORDER BY RANDOM()
        LIMIT {:limit}
    `;

    const result = arrayOf(new DynamicModel({
        'id': '',
        'name': '',
        'bio': '',
        'images': [],
        'breed': '',
        'isAvailableForAdoption': false,
        'adoptionStatus': '',
        'adoptionRequirements': '',
        'adoptionReason': '',
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
            return { ...profile, distance };
        } catch (error) {
            console.log('profilesWithDistance error, returning distance as null: ', error);
            return { ...profile, distance: null };
        }
    });

    const filteredBySearchDistance = profilesWithDistance.filter(profile => profile.distance === null || profile.distance <= userPreferences.searchDistance);

    const formattedProfiles = filteredBySearchDistance.map(profile => ({
        ...profile,
        distance: profile.distance !== null ? `${profile.distance} km` : null
    }));

    return c.json(200, {
        "items": formattedProfiles,
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
        LIMIT {:limit}
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

routerAdd("POST", "/api/custom/verify-pin", (c) => {
    const data = new DynamicModel({
        email: '',
        pin: ''
    });
    c.bindBody(data);

    try {
        const user = $app.findFirstRecordByData('users', 'email', data.email);

        const storedPin = user.get('verificationPin');
        const expiresAt = new Date(user.get('pinExpiresAt'));

        if (storedPin !== data.pin || new Date() > expiresAt) {
            return c.json(400, { error: 'invalid or expired PIN' });
        }

        user.set('verified', true);
        user.set('verificationPin', '');
        $app.save(user);

        return c.json(200, { success: true });

    } catch (error) {
        return c.json(400, { error: 'user not found '});
    }
});

routerAdd("POST", "/api/custom/resend-pin", (c) => {
    const data = new DynamicModel({
        email: ''
    });
    c.bindBody(data);
    
    try {
        const user = $app.findFirstRecordByData('users', 'email', data.email);

        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        user.set('verificationPin', newPin);
        user.set('pinExpiresAt', expiresAt);
        $app.save(user);

        const mailClient = $app.newMailClient();
        const message = new MailerMessage({
            from: { address: 'petapetsupport@gmail.com', name: 'pet-a-pet app'},
            to: [{ address: data.email }],
            subject: 'your new pet-a-pet verification code',
            html: `your new code is: <strong>${newPin}</strong>`
        });
        mailClient.send(message);

        return c.json(200, { success: true });
    } catch (error) {
        // success to not leak emails
        return c.json(200, { success: true });
    }
});

routerAdd("GET", "/api/rescue-feed", (c) => {

    const user = c.auth;
    let userCoords = null;
    const userPreferences = JSON.parse(user.get('preferences'));
    try {
        const currentUser = new DynamicModel({ coordinates: '' });
        $app.db().newQuery(
            `SELECT COALESCE(coordinates, '') as coordinates FROM users WHERE id = {:userId}`
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

    try {
        const rawQuery = (c.request && c.request.url && c.request.url.rawQuery) || "";

        const pageMatch = rawQuery.match(/[?&]page=(\d+)/);
        if (pageMatch) page = parseInt(pageMatch[1]);

        const perPageMatch = rawQuery.match(/[?&]perPage=(\d+)/);
        if (perPageMatch) perPage = parseInt(perPageMatch[1]);

    } catch (e) {
        console.log("api/rescue-feed: Query parse error, using defaults:", e);
    }

    const limit = perPage;
    const offset = (page - 1) * perPage;

    let bindParams = { userId: user.id, limit, offset };
    const finalQuery = `
        SELECT 
            id,
            name,
            bio,
            images,
            breed,
            isAvailableForAdoption,
            adoptionStatus,
            adoptionRequirements,
            adoptionReason,
            'pet' as type,
            owner as ownerId,
            age,
            created,
            (SELECT username FROM users WHERE id = pets.owner) as ownerName,
            (SELECT images FROM users WHERE id = pets.owner) as ownerImage,
            (SELECT coordinates FROM users WHERE id = pets.owner) as ownerCoordinates
        FROM pets
        WHERE owner != {:userId}
            AND isAvailableForAdoption = true
            AND (SELECT accountType FROM users WHERE id = pets.owner) NOT LIKE '%shelter%'
            AND id NOT IN (SELECT targetPet FROM swipes WHERE user = {:userId} AND swipeType = 'pet')
            AND owner NOT IN (SELECT user2 FROM matches WHERE user1 = {:userId} AND status = 'active')
            AND owner NOT IN (SELECT user1 FROM matches WHERE user2 = {:userId} AND status = 'active')
            AND (SELECT accountType FROM users WHERE id = pets.owner) NOT LIKE '%seeker%'
        ORDER BY RANDOM()
        LIMIT {:limit}
    `;

    const result = arrayOf(new DynamicModel({
        'id': '',
        'name': '',
        'bio': '',
        'images': [],
        'breed': '',
        'isAvailableForAdoption': false,
        'adoptionStatus': '',
        'adoptionRequirements': '',
        'adoptionReason': '',
        'type': '',
        'ownerName': '',
        'ownerImage': '',
        'ownerId': '',
        'ownerCoordinates': '',
        'age': 0,
        'created': ''
    }));

    $app.db().newQuery(finalQuery).bind(bindParams).all(result);


    const profilesWithDistance = result.map(profile => {
        
    if (!userCoords || !profile.ownerCoordinates) return { ...profile, distance: null }
        try {
            const otherCoords = JSON.parse(profile.ownerCoordinates);
            const distance = haversine(userCoords.lat, userCoords.lng, otherCoords.lat, otherCoords.lng);
            return { ...profile, distance };
        } catch (error) {
            console.log('profilesWithDistance error, returning distance as null: ', error);
            return { ...profile, distance: null };
        }
    });

    const filteredBySearchDistance = profilesWithDistance.filter(profile => profile.distance === null || profile.distance <= userPreferences.searchDistance);

    const formattedProfiles = filteredBySearchDistance.map(profile => ({
        ...profile,
        distance: profile.distance !== null ? `${profile.distance} km` : null
    }));

    return c.json(200, {
        "items": formattedProfiles,
        "page": page,
        "perPage": perPage
    });

}, $apis.requireAuth('users'));

routerAdd("POST", "/api/shelter-connect", (c) => {

    const user = c.auth;
    const data = new DynamicModel({ shelterOwnerId: '' });
    c.bindBody(data);

    if (user.id === data.shelterOwnerId) {
        return c.json(400, { error: 'trying to message your own shelter' });
    }

    try {
        const existing = $app.findFirstRecordByFilter(
            'matches',
            `(user1 = {:userId} && user2 = {:ownerId} || user1 = {:ownerId} && user2 = {:userId})`,
            { userId: user.id, ownerId: data.shelterOwnerId }
        );
        return c.json(200, { matchId: existing.id, isExisting: true });
    } catch (error) {
        console.log('no existing match found');
    }

    const matchesCollection = $app.findCollectionByNameOrId('matches');
    const match = new Record(matchesCollection);
    match.set('user1', user.id);
    match.set('user2', data.shelterOwnerId);
    match.set('status', 'active');
    $app.save(match);

    return c.json(200, { matchId: match.id, isExisting: false });
    
}, $apis.requireAuth('users'));