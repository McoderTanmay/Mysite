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
 // Login
app.post("/login", (req, res) => {
  const loginUrl = "http://localhost:8092/api.svc/api/Credential/Connect";
  const data = JSON.stringify(req.body);

  axios
    .post(loginUrl, data)
    .then(async (response) => {
      const sessionID = await response.data;
      res.cookie("SessionId", sessionID);
      res.redirect("/retrieve");
    })
    .catch(async (error) => {
      const errorLogin = await error;
      res.redirect("/?error=" + encodeURIComponent(errorLogin));
    });
});

app.get("/retrieve", (req, res) => {
  // console.log("we are in retrieve");
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
      "http://localhost:8092/api.svc/api/Business_Contact/RetrieveMultipleRecords",
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

app.get('/edit',(req,res)=>{
  res.render("edit.liquid");
})

app.post("/edit", (req, res) => {
  const sessionID = req.cookies["SessionId"];
  const headers = {
    SessionId: sessionID,
  };
  const Business_ContactId =req.cookies["Business_ContactId"];
  
  const data =JSON.stringify( {
    Business_ContactId,
    FirstName:req.body.FirstName,
    LastName:req.body.LastName,
    Phone:req.body.Phone,
    Email:req.body.Email,
    
  });
  console.log(data);
  axios.post("http://localhost:8092/api.svc/api/Business_Contact/UpdateRecord", data,{headers})
  .then(async (response)=>{
    console.log("status code: ",response.status);
    await res.clearCookie("Business_ContactId")
    res.redirect('/retrieve');

  })
  .catch(error=>{
    console.log('Error in Updating :',error);
  })
});

app.get('/delete',(req,res)=>{
  // const Business_ContactId =req.cookies["Business_ContactId"];
  const sessionID = req.cookies["SessionId"];
  const data=JSON.stringify({
    Business_ContactId:req.cookies["Business_ContactId"],
  })
  const headers = {
    SessionId: sessionID,
  };
  axios.post("http://localhost:8092/api.svc/api/Business_Contact/DeleteRecord",data,{ headers})
  .then( (response)=>{
    res.clearCookie("Business_ContactId")
    res.redirect("/retrieve");
  })
  .catch(error=>{
    res.render('edit.liqid',{Error:error})
    console.log('Error in Deleting :',error);
  })
});
 


app.get("/createRecord", (req, res) => {
  res.render("createRecord.liquid");
})

app.post("/createRecord", (req, res) => {

  const sessionId = req.cookies["SessionId"];
  const POSTdata = JSON.stringify(req.body);
  const loginUrl = "http://localhost:8092/api.svc/api/Business_Contact/CreateRecord"
  const headers = {
      SessionId: sessionId,
  };

  axios
      .post(loginUrl, POSTdata, { headers })
      .then((response) => {
           console.log(response.status);
           res.redirect("/retrieve");
      })
      .catch((error) => {
          const errorLogin = error;
          res.redirect("/?error =" + encodeURIComponent(errorLogin));
      });
})

app.listen(3000, () => {
  console.log("app is running on port: 3000");
})