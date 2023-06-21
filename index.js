const option_Func = (meth, path, id) => {
  var options = {
    host: "localhost",
    port: 8092,
    path: "/api.svc/api" + path,
    method: meth,
    headers: {
      SessionId: id,
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  };
  return options;
};

response.on("data", (d) => {
        sessionID = JSON.parse(d);
        console.log(sessionID);
        // res.render('index.liquid',{status:'Connection Establish',ID:sessionID });
      });

let httpreq = http.request(
    option_Func("POST", "/Credential/Connect", null),
    async (response) => {
      console.log("statusCode:", response.statusCode);
      console.log("headers:", response.headers);

      response.on("data", (d) => {
        sessionID = JSON.parse(d);
        console.log(sessionID);
        // res.render('index.liquid',{status:'Connection Establish',ID:sessionID });
      });
      if (response.statusCode === 200) {
        res.render("index.liquid", {
          status: "Connection Establish",
          ID: JSON.stringify(sessionID),
        });
      } else {
        res.render("index.liquid", {
          status: "Invalid Credentials",
          ID: sessionID,
        });
      }
    }
  );
  httpreq.on("error", (error) => {
    console.log("An error", error);
  });
  httpreq.write(data);
  httpreq.end();
  