const app = require("express")();

app.use(require("body-parser").json());

app.use((req, res, next) => {
    console.log("Request");
    next();
})

app.head("/", (req, res) => {
    return res.status(200).end();
});

app.post("/", (req, res) => {
    console.log(req.body);
    res.status(200).end();
})

app.listen(2400, () => console.log("Listening on 2400"));