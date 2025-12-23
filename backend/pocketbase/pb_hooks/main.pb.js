/// <reference path="../pb_data/types.d.ts" />

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