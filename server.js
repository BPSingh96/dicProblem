const http = require('http');
const axios = require("axios");;
const port = 3000;
const APIKEY = 'dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf';
const server = http.createServer(async(req, res) =>{
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(await listUsers())
});
const listUsers = async () => {
    let result = [];
    try {
        const res = await axios.get('http://norvig.com/big.txt');
        if (res.status===200 && res.data){
            let allwords={},inList, data = res.data, synonyms = null, pos = null;
            data = data.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, " ");
            inList = data.split(' ');
            for (index in inList){
                if (inList[index] === '') continue;
                if(allwords[inList[index]]){
                    allwords[inList[index]] += 1;
                }else allwords[inList[index]] = 1;
            }
            for(let counter=0; counter<10; counter++){
                if (Object.getOwnPropertyNames(allwords).length){
                    let word = Object.keys(allwords).reduce(function(a, b){ return allwords[a] > allwords[b] ? a : b });
                    const dictRes = await axios.get(`https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${APIKEY}&text=${word}&lang=en-en`)
                    if(dictRes.status === 200 && dictRes.data){
                        if (dictRes.data.def && dictRes.data.def[0]){
                            synonyms = dictRes.data.def[0].text;
                            pos = dictRes.data.def[0].pos;
                        }else{
                            pos = synonyms = null;
                        }
                    }
                    result.push({Word: word, Occurrence: allwords[word], Synonyms: synonyms, Pos: pos});
                    delete allwords[word];
                }else break;
            }
            console.log(result);
        }
    } catch (err) {
        console.error(err);
    }
    return JSON.stringify(result);
};


//start sever on specfic port
server.listen(port, () => {
    console.log(`Server running at :${port}/`);
    
});
