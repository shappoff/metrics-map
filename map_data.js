const process = require('process');
const {
    applicationID, searchOnlyAPIKey
} = process.env;

const algoliasearch = require("algoliasearch");
const fs = require("fs");


const run = async () => {
    // const client = algoliasearch(`${applicationID}`, `${searchOnlyAPIKey}`);
    const client = algoliasearch(applicationID, searchOnlyAPIKey);

    const indexBorn = client.initIndex(`born`);
    const indexMarriage = client.initIndex(`marriage`);
    const indexDied = client.initIndex(`died`);

    const {facets: bornFacets} = await indexBorn.search('', {hitsPerPage: 0, facets: ["churchTitle"]}).catch((e) => console.error('bornError', e));
    const {facets: marriageFacets} = await indexMarriage.search('', {hitsPerPage: 0, facets: ["churchTitle"]}).catch((e) => console.error('marriageError', e));
    const {facets: diedFacets} = await indexDied.search('', {hitsPerPage: 0, facets: ["churchTitle"]}).catch((e) => console.error('diedError', e));

    const res = {};

    for (const key in bornFacets.churchTitle) {
        res[key] = {
            all: bornFacets.churchTitle[key],
            born: bornFacets.churchTitle[key]
        };
    }

    for (const key in marriageFacets.churchTitle) {
        if (!res[key]) {
            res[key] = {all: 0};
        }
        res[key].all = res[key].all + marriageFacets.churchTitle[key];
        res[key].marriage = marriageFacets.churchTitle[key];
    }

    for (const key in diedFacets.churchTitle) {
        if (!res[key]) {
            res[key] = {all: 0};
        }

        res[key].all = res[key].all + diedFacets.churchTitle[key];
        res[key].died = diedFacets.churchTitle[key];
    }

    // console.log(res);
    fs.mkdir('./dist/', { recursive: true }, (err) => {
        if (err) throw err;
    });
    fs.writeFileSync(`./dist/map_data.json`, `${JSON.stringify(res)}`, {encoding: 'utf8', flag: 'w'});
    fs.readdir('./dist/', (err, files) => {
        if (err) console.log(err)
        console.log('files', JSON.stringify(files));
    })
    return res;
};

run();
