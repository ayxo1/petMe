/// <reference path="../pb_data/types.d.ts" />

//pet-feed endpoint
routerAdd("GET", "/api/pet-feed", (c) => {
    
    const user = c.auth;

    // if (!user) {
    //     return c.json(401, { "message": "Unauthorized" });
    // }

    let page = 1;
    let perPage = 20;

    try {
        const rawQuery = (c.request && c.request.url && c.request.url.rawQuery) || "";
        
        const pageMatch = rawQuery.match(/[?&]page=(\d+)/);
        if (pageMatch) page = parseInt(pageMatch[1]);

        const perPageMatch = rawQuery.match(/[?&]perPage=(\d+)/);
        if (perPageMatch) perPage = parseInt(perPageMatch[1]);

    } catch (e) {
        console.log("Query parse error, using defaults:", e);
    }

    const limit = perPage;
    const offset = (page - 1) * perPage;

    const result = arrayOf(new DynamicModel({
        "id": "",
        "created": "",
        "updated": "",
        "collectionId": "",
        "collectionName": "",
        "owner": "",
        "name": "",
        "species": "",
        "breed": "",
        "age": 0,
        "bio": "",
        "images": [],
        "isAvailableForAdoption": false,
        "adoptionStatus": ""
    }));

    $app.db()
        .newQuery(`
            SELECT pets.* 
            FROM pets
            WHERE 
                pets.owner != {:userId}
                AND pets.isAvailableForAdoption = FALSE
                AND pets.id NOT IN (
                    SELECT targetPet 
                    FROM swipes 
                    WHERE user = {:userId} 
                    AND swipeType = 'pet'
                )
            ORDER BY pets.created DESC
            LIMIT {:limit} OFFSET {:offset}
        `)
        .bind({
            "userId": user.id,
            "limit": limit,
            "offset": offset
        })
        .all(result);

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
        'targetPet': '',
        'action': ''
    });
    c.bindBody(data);

    const targetPetId = data.targetPet;
    const action = data.action; // 'like | pass'

    if (!targetPetId || !action) return c.json(400, { message: "missing targetPet or action"});

    try {
        const swipes = $app.findCollectionByNameOrId('swipes');
        const record = new Record(swipes);
        record.set('user', user.id);
        record.set('targetPet', targetPetId);
        record.set('action', action);
        record.set('swipeType', 'pet');
        $app.save(record);

    } catch (error) {
        console.error('swipe endpoint record error', error);
    }

    // 'pass' scenario
    if(action !== 'like') return c.json(200, { isMatch: false });

    // check for match
    try {
        const targetPet = $app.findRecordById('pets', targetPetId);
        const petOwnerId = targetPet.get('owner');

        const myPets = $app.findRecordsByFilter(
            'pets',
            'owner = {:id}',
            '-created',  // how to sort
            100, // limit
            0,  // offset
            { id: user.id } // params
        );

        const myPetIds = myPets.map(pet => pet.id);

        // owner -> owner scenario:
        if(myPetIds.length > 0) {
            const orFilter = myPetIds.map(id => `targetPet='${id}'`).join(" || ");
            const mutualLike = $app.findFirstRecordByFilter(
                "swipes",
                `user = {:otherUser} && action = 'like' && swipeType = 'pet' && (${orFilter})`,
                { 
                    otherUser: petOwnerId
                }
            );

            if (mutualLike) {
                const matches = $app.findCollectionByNameOrId('matches');

                const match = new Record(matches);
                match.set('user1', user.id);
                match.set('user2', petOwnerId);
                match.set('pet1', myPetIds[0]);
                match.set('pet2', targetPetId);
                match.set('status', 'pending');

                $app.save(match);

                return c.json(200, { isMatch: true, matchId: match.id});
            }
        }

    } catch (error) {
        console.error('match check error, swipes endpoint', error);
    }

    return c.json(200, { isMatch: false });
}, $apis.requireAuth('users'));