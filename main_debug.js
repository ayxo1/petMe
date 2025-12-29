/// <reference path="../pb_data/types.d.ts" />

//pet-feed endpoint
routerAdd("GET", "/api/feed", (c) => {
    
    const user = c.auth;

    let page = 1;
    let perPage = 20;
    let rawTypes = 'pets';

    try {
        const rawQuery = (c.request && c.request.url && c.request.url.rawQuery) || "";

        const typeMatch = rawQuery.match(/[?&]type=([^&]+)/);
        if (typeMatch) rawTypes = typeMatch[1];

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
    const isAvailableForAdoption = types.includes('rescue') ? true : false;

    let queries = [];
    let bindParams = { userId: user, limit, offset };

    if (types.includes('pets')) {
        queries.push(`
            SELECT id, name, bio, 'pet' as type, owner as ownerId, age, created
            FROM pets
            WHERE owner != {:userId} AND isAvailableForAdoption = ${isAvailableForAdoption}
            AND id NOT IN (SELECT targetId FROM swipes WHERE user = {:userId} AND swipeType = 'pet')
            `);
    }

    let accountPatterns = [];
    if (types.includes('seekers')) accountPatterns.push('seeker');
    if (types.includes('shelters')) accountPatterns.push('shelter');
    if (types.includes('owners')) accountPatterns.push('owner');

    const accountFilter = accountPatterns.map(pattern => `accountType LIKE '%${pattern}%'`).join(' OR ');

    queries.push(`
        SELECT id, username as name, bio, profileImage as images, 'profile' as type, id as ownerId, 0 as age, created
        FROM users
        WHERE id != {:userId}
            AND isHidden = FALSE
            AND (${accountFilter})
            AND id NOT IN (SELECT targetId FROM swipes WHERE user = {:userId} AND swipeType = 'profile')
    `);

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
        'ownerId': '',
        'age': 0
    }));

    $app.db().newQuery(finalQuery).bind(bindParams).all(result);

    // const result = arrayOf(new DynamicModel({
    //     "id": "",
    //     "created": "",
    //     "updated": "",
    //     "collectionId": "",
    //     "collectionName": "",
    //     "owner": "",
    //     "name": "",
    //     "species": "",
    //     "breed": "",
    //     "age": 0,
    //     "bio": "",
    //     "images": [],
    //     "isAvailableForAdoption": false,
    //     "adoptionStatus": ""
    // }));

    // $app.db()
    //     .newQuery(`
    //         SELECT pets.* 
    //         FROM pets
    //         WHERE 
    //             pets.owner != {:userId}
    //             AND pets.isAvailableForAdoption = FALSE
    //             AND pets.id NOT IN (
    //                 SELECT targetPet 
    //                 FROM swipes 
    //                 WHERE user = {:userId} 
    //                 AND swipeType = 'pet'
    //             )
    //         ORDER BY pets.created DESC
    //         LIMIT {:limit} OFFSET {:offset}
    //     `)
    //     .bind({
    //         "userId": user.id,
    //         "limit": limit,
    //         "offset": offset
    //     })
    //     .all(result);

    return c.json(200, {
        "items": result,
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
    record.set('targetId', targetId);
    record.set('action', action);
    record.set('swipeType', swipeType);
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

        let filter = `user = {:otherUser} && action = 'like' && (targetId = {:myId}`;
        myPetIds.forEach(petId => {
            filter += ` || targetId = '${petId}'`;
        });
        filter += `)`;

        const mutualLikes = $app.findRecordsByFilter(
            'swipes', 
            filter, 
            '-created',
            1,
            {
                otherUser: petOwnerId,
                myId: user.id
            }
        );

        if (mutualLikes > 0) {
            const matches = $app.findCollectionByNameOrId('matches');

            const match = new Record(matches);
            match.set('user1', user.id);
            match.set('user2', petOwnerId);
            match.set('pet1', myPetIds[0]);
            match.set('pet2', targetId);
            match.set('status', 'pending');

            $app.save(match);

            return c.json(200, { isMatch: true, matchId: match.id});
        }
    } catch (error) {
        console.error('match check error, swipes endpoint', error);
    }

    return c.json(200, { isMatch: false });
}, $apis.requireAuth('users'));
