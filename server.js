const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const liquidViews = require("liquid-express-views");
const exp = express();
exp.use(cookieParser());
exp.use(express.urlencoded());
const app = liquidViews(exp);

app.get("/", (req, res) => {
  let errorLogin = req.query["error"];
  res.render("login.liquid", { Error: errorLogin });
});

function api_post(urlPrefix,data,headers,res)
{
  axios
  .post(
    "https://www.famark.com/host/api.svc/api"+urlPrefix,
    data,
    { headers }
  )
  .then(async (response) => {
    await res.clearCookie("Business_ContactId");
    res.redirect("/retrieve");
  })
  .catch((error) => {
    res.redirect("/retrieve?error =" + encodeURIComponent(error));
  });
}

// Login
app.post("/login", (req, res) => {
  const loginUrl = "https://www.famark.com/host/api.svc/api/Credential/Connect";
  const data = JSON.stringify(req.body);
  axios
    .post(loginUrl, data)
    .then(async (response) => {
      const sessionID = await response.data;
      res.cookie("SessionId", sessionID);
      res.redirect("/retrieve");
    })
    .catch((error) => {
      const errorLogin = error;
      console.log(error);
      res.redirect("/?error=" + encodeURIComponent(errorLogin));
    });
});

app.get("/retrieve", (req, res) => {
  const sessionID = req.cookies["SessionId"];
  const RETdata = JSON.stringify({
    Columns: "FullName,Phone,Email,Business_ContactId",
    OrderBy: "FullName",
  });
  const headers = {
    SessionId: sessionID,
  };
  axios
    .post(
      "https://www.famark.com/host/api.svc/api/Business_Contact/RetrieveMultipleRecords",
      RETdata,
      { headers }
    )
    .then(async (response) => {
      console.log("Status: ", response.status);
      let contactData = await response.data;
      console.log(contactData);
      res.render("index.liquid", { contacts: contactData });
    })
    .catch((error) => {
      console.error("Error in retreving:", error);
    });
});

app.get("/logout", (req, res) => {
  res.clearCookie("SessionId");
  res.redirect("/");
});

app.get("/edit", (req, res) => {
  res.render("edit.liquid");
});

app.post("/edit", (req, res) => {
  const sessionID = req.cookies["SessionId"];
  const headers = {
    SessionId: sessionID,
  };
  const Business_ContactId = req.cookies["Business_ContactId"];

  const data = JSON.stringify({
    Business_ContactId,
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    Phone: req.body.Phone,
    Email: req.body.Email,
  });
  console.log(data);
  api_post('/Business_Contact/UpdateRecord',data,headers,res);
  
});

app.get("/delete", (req, res) => {
  const sessionID = req.cookies["SessionId"];
  const data = JSON.stringify({
    Business_ContactId: req.cookies["Business_ContactId"],
  });
  const headers = {
    SessionId: sessionID,
  };
  api_post('/Business_Contact/DeleteRecord',data,headers,res);
 
});

app.get("/createRecord", (req, res) => {
  res.render("createRecord.liquid");
});

app.post("/createRecord", (req, res) => {
  const sessionId = req.cookies["SessionId"];
  const POSTdata = JSON.stringify(req.body);
  const headers = {
    SessionId: sessionId,
  };
  api_post('/Business_Contact/CreateRecord',POSTdata,headers,res)
});

app.listen(3000, () => {
  console.log("app is running on port: 3000");
});
