//테이블 선언

import knex, {Knex} from 'knex';


export const wrapper =async (db : Knex) =>
{
    async function createTableIfNotExists(name:string, func : any)
    {
        const exists = await db.schema.hasTable(name);
        if(!exists)
            await db.schema.createTable(name, func);
    }

    await createTableIfNotExists('Users', (table:any) => {
        table.bigIncrements('id').unique().primary();
        table.string('email');
        table.string('password',128); //SHA3 512
        table.string('salt', 64);
        table.string('nickname');
        table.string('username').unique();
        //table.string('phone');
        table.string('picture');
        table.dateTime('createdat').defaultTo(db.fn.now());
    })

    await createTableIfNotExists('Collections', (table:any) => {
        table.bigIncrements('id').unique().primary();
        table.string('bannerimg');
        table.string('logoimg');
        table.string('featuredimg');
        table.string('name',255).unique();
        table.text('description');
        //table.string('symbol', 4);
        table.bigInteger('creator').unsigned();
        table.foreign('creator').references('Users.id');
        table.dateTime('createdat').defaultTo(db.fn.now());
    });

    await createTableIfNotExists('Assets', (table:any) => {
        table.bigIncrements('id').unique().primary();
        table.string('name',64).unique();
        table.string('symbol', 4);
        table.text('description');
        table.integer('totaltokens');
        table.string('ipfshash');
        table.string('address').unique();
        table.unique(['name', 'symbol']);
        //table.primary(['name', 'symbol']);
        table.bigInteger('creator').unsigned();
        table.foreign('creator').references('Users.id');
        table.bigInteger('collectionid').unsigned();
        table.foreign('collectionid').references('Collections.id');
        table.dateTime('createdat').defaultTo(db.fn.now());
    });

    await createTableIfNotExists('AssetTokens', (table:any) => {
        table.string('owneraddress');
        table.integer('index');
        table.bigInteger('ownerid').unsigned();
        table.foreign('ownerid').references('Users.id');
        table.bigInteger('assetid').unsigned();
        table.foreign('assetid').references('Assets.id');
        table.unique(['index','assetid']);
    })

    await createTableIfNotExists('Metamasks', (table:any) => {
        table.string('address').unique().primary();
        table.bigInteger('userid').unsigned();
        table.foreign('userid').references('Users.id');
    });

    await createTableIfNotExists('Activities', (table:any)=>{
        table.bigIncrements('id').unique().primary();
        table.smallint('type').unsigned(); // 0:Minted, 1: List, 2: Offer, 3: Sale, 4: Transfer
        table.bigInteger('tokenindex').unsigned();
        table.bigInteger('assetid').unsigned();
        table.foreign('assetid').references('Assets.id');
        table.string('from');
        table.string('to');
        table.double('cost').unsigned();
        table.dateTime('timestamp').defaultTo(db.fn.now());
        table.dateTime('due');
        table.boolean('done').defaultTo(false);
    });

    await createTableIfNotExists('Watches', (table:any)=>{
        //table.bigIncrements('id').unique().primary();
        table.bigInteger('userid').unsigned();
        table.foreign('userid').references('Users.id');
        table.bigInteger('collectionid').unsigned();
        table.foreign('collectionid').references('Collections.id');
        table.unique(['userid','collectionid']);
        table.primary(['userid','collectionid'])
    });

    await createTableIfNotExists('Favorites', (table:any)=>{
        //table.bigIncrements('id').unique().primary();
        table.bigInteger('userid').unsigned();
        table.foreign('userid').references('Users.id');
        table.bigInteger('assetid').unsigned();
        table.foreign('assetid').references('Assets.id');
        table.unique(['userid','assetid']);
        table.primary(['userid','assetid'])
    });
    /*
    await db.schema.createTable('Bids', (table)=>{
        table.bigIncrements('id').unique().primary();
        table.bigInteger('tokenindex').unsigned();
        table.bigInteger('assetid').unsigned();
        table.foreign('assetid').references('Assets.id');
        table.string('from');
        table.double('cost').unsigned();
        table.dateTime('due');
    });*/
}