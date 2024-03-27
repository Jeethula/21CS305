var express = require('express');
var app = express();
var axios = require('axios')

app.get('/', function (req, res) {
   res.send('Afford Medical test');
})

function add(accumulator, a) {
    return accumulator + a;
  }

const prev = {
    'e':[],
    "r":[],
    "p":[],
    "f":[]
    
}
const request = {
    "e":"even",
    "r":"rand",
    "f":"fibo",
    "p":"primes"
}
app.get("/number/:id",async(req,res)=>{
try {
    

     let id = req.params.id
    if (!(id in request)) {
        return res.status(400).json({ error: 'Invalid id' });
    }

const r = await axios.get(`http://20.244.56.144/numbers/${request[id]}`);
curr = r.data.numbers
const result = {}
result["numbers"] = curr
result["windowPrevState"] = prev[id] 
result["windowCurrState"] = curr 
let avg = curr.reduce(add, 0)
result["avg"] = avg
prev[id] = curr
return res.json(result)
} catch (error) {
    return res.status(500).json({"error":"unable to handle"})
}
})

var server = app.listen(3000, function () {
   console.log("Express App running at 3000");
})