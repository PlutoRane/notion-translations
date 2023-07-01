import { Client } from "@notionhq/client";
import chalk from "chalk";

import { get_databases } from "../api";
import { Config } from "../config";
import { Database } from "../model";
import { select_from_list } from "../util/cli";
import { notImplementedYet } from "../util/fn";

export async function add(config: Config, client: Client) {
    const databases = (await get_databases(client)).unwrap();

    if (databases.length === 0) {
        console.error(
            "No tables shared with this integration. Add some through the notion ui",
        );
        return;
    }

    const available: Database[] = [];
    for (const db of databases) {
        const idx = config.databases.findIndex((t) => t.id === db.id);
        const database: Database = { id: db.id, name: db.title[0].plain_text };
        if (idx >= 0) {
            config.update_database_at(idx, database);
        } else {
            available.push(database);
        }
    }

    if (available.length === 1) {
        notImplementedYet("TODO: Ask if the user want to add the single table");
    }

    const arr = await select_from_list(
        "Multiple tables found. Please pick the ones you want to process",
        available.map((db) => ({ title: db.name, value: db })),
    );

    config.add_databases(arr);
}

export async function remove(config: Config) {
    if (config.databases.length === 0) {
        console.warn("No databases to remove.");
        return;
    }

    const arr = await select_from_list(
        "Pick the databases you want to remove",
        config.databases.map((db) => ({ title: db.name, value: db })),
    );

    for (const db of arr) {
        config.remove_database(db);
    }
}

export function list(config: Config) {
    if (config.databases.length === 0) {
        console.warn("No databases currently used.");
        return;
    }
    console.group("Databases used for generating language files:");
    for (const db of config.databases) {
        console.log(`${chalk.cyan(db.name)} (${chalk.red(db.id)})`);
    }
    console.groupEnd();
}

export async function sync(config: Config, client: Client) {
    notImplementedYet(
        "TODO: Update names in the config with the names in notion. Also allow for removing databases that no longer exist on notion",
    );
}
