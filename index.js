const axios = require("axios");
const { response } = require("express");
let url='https://www.famark.com/host/api.svc/api';
function api_post(urlsuffix, data, headers, res) {
    axios
      .post(url + urlsuffix, data, {
        headers,
      })
      .then(async (response) => {
        await res.clearCookie("Business_ContactId");
        res.redirect("/retrieve");
      })
      .catch((error) => {
        console.log(error)
        res.redirect("/retrieve?error=" + encodeURIComponent(error));
      });
  }

function loginHandeler(loginUrl,data,res)
{
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
}
function retrieveHandeler(url,data,headers,res,req){
    axios
    .post(url,data,{ headers })
    .then(async (response) => {
      const error01 = req.query["error"];
      console.log("Status: ", response.status);
      let contactData = await response.data;
      console.log(contactData);
      res.render("index.liquid", { contacts: contactData, error: error01 });
    })
    .catch((error) => {
      console.error("Error in retreving:", error);
    });
}
module.exports={api_post,loginHandeler,retrieveHandeler}