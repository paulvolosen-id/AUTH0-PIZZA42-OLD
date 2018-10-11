      
      
      angularAuth0.client.userInfo(authResult.accessToken, function(err, user) {
        if (err) {
          return console.log(err);
        }
        else{          
          console.log ("email verified.." + JSON.parse(user.email_verified));
          localStorage.setItem('emailVerified', user.email_verified);
        }
      });