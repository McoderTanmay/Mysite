const express = require("express");
const axios = require("axios");
const { body, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
const liquidViews = require("liquid-express-views");
const apiActionHandeler=require('./index')
const exp = express();
exp.use(cookieParser());
exp.use(express.urlencoded());
const app = liquidViews(exp);

let url='https://www.famark.com/host/api.svc/api';
app.get("/", (req, res) => {
  let errorLogin = req.query["error"];
  res.render("login.liquid", { Error: errorLogin });
});

app.post("/login", (req, res) => {
  const loginUrl = url+'/Credential/Connect';
  const data = JSON.stringify(req.body);
  apiActionHandeler.loginHandeler(loginUrl,data,res);
});

app.get("/retrieve", (req, res) => {
  const error01 = req.query["error"];
  const sessionID = req.cookies["SessionId"];
  const RETdata = JSON.stringify({
    Columns: "FullName,Phone,Email,Business_ContactId,FirstName,LastName",
    OrderBy: "FullName",
  });
  const headers = {
    SessionId: sessionID,
  };
  const urlRetrieve=url+'/Business_Contact/RetrieveMultipleRecords'
  apiActionHandeler.retrieveHandeler(urlRetrieve,RETdata,headers,res,req);
});

app.get("/logout", (req, res) => {
  res.clearCookie("SessionId");
  res.redirect("/");
});

app.get("/edit", (req, res) => {
  const phone = req.query["phone"];
  const email = req.query["email"];
  const firstName = req.query["firstName"];
  const lastName = req.query["lastName"];
  const Business_ContactId=req.query['contactId']
  res.cookie("Business_ContactId", Business_ContactId);
  console.log('contact id is',Business_ContactId);

  res.render("edit.liquid", {
    phone: phone,
    firstName: firstName,
    lastName: lastName,
    email: email,
    Business_ContactId:Business_ContactId,
  });
});
app.get("/cancel", (req, res) => {
  res.redirect("/retrieve");
});

let inputValidation=[body("FirstName")
.notEmpty()
.isLength({ max: 15 })
.withMessage("Invalid Field")
.escape(),
body("LastName")
.notEmpty()
.isLength({ max: 15 })
.withMessage("Invalid Field")
.escape(),
body("Phone")
.notEmpty()
.isLength({ max: 15 })
.withMessage("Invalid Field")
.escape(),
body("Email")
.notEmpty()
.isEmail()
.withMessage("Invalid Field")
.normalizeEmail(),]

app.post("/edit",inputValidation,(req, res) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return res.render("edit.liquid", { error:'Invalid Field'});
    }
    const Business_ContactId=req.cookies['Business_ContactId'];
    const sessionID = req.cookies["SessionId"];
    const headers = {
      SessionId: sessionID,
    };
    // const contactId = req.query["contactId"];
    const data = JSON.stringify({
      Business_ContactId: Business_ContactId,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Phone: req.body.Phone,
      Email: req.body.Email,
    });
    console.log(data);
    apiActionHandeler.api_post('/Business_Contact/UpdateRecord',data,headers,res);
    // api_post(,, ,);/Business_Contact/UpdateRecord
  }
);

app.get("/delete", (req, res) => {
  const sessionID = req.cookies["SessionId"];
  const data = JSON.stringify({
    Business_ContactId: req.query["contactId"],
  });
  const headers = {
    SessionId: sessionID,
  };
  apiActionHandeler.api_post("/Business_Contact/DeleteRecord", data, headers, res);
});

app.get("/createRecord", (req, res) => {
  res.render("createRecord.liquid");
});

app.post("/createRecord",inputValidation, (req, res) => {
  const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return res.render("createRecord.liquid", { error:'Invalid Field'});
}
  const sessionId = req.cookies["SessionId"];
  const POSTdata = JSON.stringify(req.body);
  const headers = {
    SessionId: sessionId,
  };
  apiActionHandeler.api_post("/Business_Contact/CreateRecord", POSTdata, headers, res);
});

app.listen(3000, () => {
  console.log("app is running on port: 3000");
});
