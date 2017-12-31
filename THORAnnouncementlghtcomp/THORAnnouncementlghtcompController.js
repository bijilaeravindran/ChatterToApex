({
   
    // The main function to get all the feed details
    userFeedItem: function(component, event, helper) {
        var userFeed = component.get("c.getFeedData");
        var userTheme = component.get("v.userMode");
        console.log('UserTheme-->'+userTheme);
        var groupID = component.get("v.groupattid");
         //console.log("GroupID: " + groupID);
        userFeed.setParams({"groupId" : groupID});
        userFeed.setCallback(this,function(response){
        var state = response.getState();
            if(state==="SUCCESS"){
               var jtext     = response.getReturnValue();
               var FeedAtt   = component.get("v.groupatt");
        for (var i=0; i<10; ++i){ 
          //the feed response in JSON format pushed to FeedAtt variable 
          FeedAtt.push(jtext.elements[i]);   
          // Formatting the ISODate to Poper Date and Time format to display in the UI 
          var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var today = new Date();
          var ystrdy = new Date(new Date().setDate(today.getDate()-1)); 
          var x = jtext.elements[i].createdDate;
          var y = x.split('.')[0]+"Z";
          var createdF = new Date(y); 
          //console.log('x-->'+x+ '  '+'y-->'+y+'  '+created);
          var created = new Date(jtext.elements[i].createdDate); 
          console.log(JSON.stringify(jtext, null, 4));
           var newDate;

           if (createdF.getMinutes().toString().length == 1){
                  var reversed = "0" + createdF.getMinutes();

              }else{
                  var reversed = createdF.getMinutes();
             }
              
           //console.log('String Length-->'+createdF.getMinutes().toString().length+'  '+createdF.getMinutes()+'  '+createdF.getMinutes().toString()+'   '+reversed);

           if (today.setHours(0,0,0,0) == created.setHours(0,0,0,0)) {
            newDate =  "Today at "+ createdF.getHours() + ':'+ reversed;  
            //console.log('JSON Date-->'+jtext.elements[i].createdDate+'  '+'Converted Date-->'+created);
            jtext.elements[i].createdDate = newDate;
           } else if (ystrdy.setHours(0,0,0,0) == created.setHours(0,0,0,0)) {
             //console.log('JSON Date-->'+jtext.elements[i].createdDate+'  '+'Converted Date-->'+created);
            newDate = "Yesterday at " + createdF.getHours() + ':'+ reversed; 
             jtext.elements[i].createdDate = newDate;
           }else {
            newDate = days[created.getDay()] + ", " + months[created.getMonth()] + " " + created.getDate() + ", " + created.getFullYear()+' '+ 'at'+' ' + createdF.getHours() + ':'+ reversed; 
             //console.log('JSON Date-->'+jtext.elements[i].createdDate+'  '+'Converted Date-->'+created);
             jtext.elements[i].createdDate = newDate;
           }

      

        
        //File size conversion to KB and MB
        if (typeof jtext.elements[i].capabilities.files !== 'undefined'){
          //console.log('Filetype: ' +  jtext.elements[i].capabilities.files.items[0].fileType+'  '+jtext.elements[i].capabilities.files.items[0].renditionUrl240By180);
          if(jtext.elements[i].capabilities.files.items[0].fileSize < 1000000){
            var filex = jtext.elements[i].capabilities.files.items[0].fileSize/1024;
            jtext.elements[i].capabilities.files.items[0].fileSize = Math.round(filex)+ ' KB';
          }else if(jtext.elements[i].capabilities.files.items[0].fileSize >= 1000000){
            var filex = jtext.elements[i].capabilities.files.items[0].fileSize/1000000;
            jtext.elements[i].capabilities.files.items[0].fileSize = Math.round(filex)+ ' MB';
          } 
         
        }

          component.set("v.groupatt",FeedAtt);
             
        } 

            } else {
                console.log('Problem getting feed, response state: ' + state);
            }    
        });
        $A.enqueueAction(userFeed);
    },

   // Function to open the image onclick in a new popup window
   popupImage: function(component, event, helper) {
    
        var VersionID = event.target.getAttribute("data-id");
        console.log("VersionID-->"+VersionID);
        var url = "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=" + VersionID + "&operationContext=CHATTER";
         newWin=window.open(url, 'Popup','height=500,width=600,left=100,top=100');
    }, 

    //toggle spinner to on while loading
    showSpinner : function (component, event, helper) {
        var togglespin = component.find('spinner');
      $A.util.removeClass(togglespin,'toggle');
             
    },
 
    //toggle spinner to off after loading
    hideSpinner : function (component, event, helper) {
        var togglespin = component.find('spinner');
       $A.util.addClass(togglespin,'toggle');
          
    },

    //Check for SF1 or Desktop
     userModeCheck: function(component, event, helper) {
     var userTheme = component.get("v.userMode");
     console.log("UserTheme-->"+userTheme);
     component.set("v.userMode",userTheme);
     },


    // Redirect to THOR on button click
    gotothor: function(component, event, helper){
      console.log('Inside gotothor');
      var userTheme = component.get("v.userMode");
      var action = component.get("c.getHiearchySettings");
      action.setCallback(this, function(response){
        if(component.isValid() && response !== null && response.getState() == 'SUCCESS'){
          console.log('response-->'+response);
          var jtext     = response.getReturnValue();
            var devURL = jtext.THORURL__c;
            console.log(devURL);//Check the output
           
        
      if(userTheme == "Theme4t") { 
        console.log('SF1');
           sforce.one.navigateToURL(devURL);
      } 
      else { 
        console.log('Desktop');
      parent.window.location.href = devURL; 
        } 
      } 
    });
      $A.enqueueAction(action);
    },

    gotothorportal: function(component, event, helper){
       console.log('Inside gotothorportal');
      var action = component.get("c.getHiearchySettings");
      action.setCallback(this, function(response){
         if(component.isValid() && response !== null && response.getState() == 'SUCCESS'){
          var jtext     = response.getReturnValue();
          console.log('<--SUCCESS-->'+jtext.THORPortalURL__c);
          var portalURL = jtext.THORPortalURL__c;
         
      parent.window.location.href = portalURL;
        }
      });
       $A.enqueueAction(action);
    },

    //Share toggle
    sharetoggle : function(component, event, helper) {
        var feedItemID = event.currentTarget.dataset.feedid;
        component.set("v.feedItemIdtest",feedItemID);
        //console.log(feedItemID);
        document.getElementById(feedItemID+'-text').value = "";
        document.getElementById('show-'+feedItemID).classList.toggle('slds-hide');

     
    },

    //Scroll to top
    scrolltop : function(component, event, helper) {
        window.scrollTo(0,0);
    },

   // Get the querystring of the Username or Group name from the Text area
   listenforMentions : function(component, event, helper) {
     console.log("Listening");
        clearTimeout(window.timer);
        window.timer = setTimeout($A.getCallback(function(){
            
            /* if the menu is open close it */
            var feedID = component.get("v.feedItemIdtest");
            var cmp = document.getElementById('menu'+feedID);
            if($A.util.hasClass(cmp, "slds-hide") == false){
                $A.util.addClass(cmp,"slds-hide");
            }
            var commentBody = document.getElementById(feedID+'-text').value;
             console.log("commentBody-->"+commentBody);
            component.set("v.comment",commentBody);
            var regex = new RegExp('@[a-z0-9_-]+', 'gi');
            /* Check if the comment has @handle & get the last used handle */
            if(regex.test(commentBody)){
                var handles = commentBody.match(regex);
                var querystring = handles[handles.length-1];
                component.set("v.queryString",querystring);
            }
        }),1000);
    },

    // Get the autocompleted user name from the Database
    getuserhandles : function(component, event, helper) {
        var user_handle = component.get("v.queryString");
        var feedID = component.get("v.feedItemIdtest");
        var action = component.get("c.getMentionCompletionPage");
        action.setParams({
            "queryString" : user_handle.replace(/@/g, '') , 
            "contextId" : feedID
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state==="SUCCESS"){
              console.log("UserHandleSuccess-->"+state);
                /* show menu */
                var menu = document.getElementById('menu'+feedID);
                $A.util.toggleClass(menu, 'slds-hide');
                
                var possible_mentions = response.getReturnValue().mentionCompletions;
                var predictions = new Array();
                for(var i=0; i< possible_mentions.length; i++){
                    predictions.push(possible_mentions[i].name);
                }
                console.log("PossibleNames-->"+predictions);
                if(predictions.length > 0){
                    var result = {
                        "needle" : user_handle,
                        "haystack" : predictions
                    };
                    component.set("v.results",result);
                    console.log("Reslut-->"+result);
                }
            }
        });

         $A.enqueueAction(action);
    },
       

     //Onclick of the preicted username, the name will be replaced after the "@" mention
     search_replace : function(component, event, helper){
        var key = event.srcElement.dataset.key;
        var value = event.srcElement.dataset.value;
        var feedID = component.get("v.feedItemIdtest");
        console.log("InsideSearchReplaceKeyAndValue-->"+key+value);
        var changed_comment = component.get("v.comment").replace(key,'@['+value+']');
        component.set("v.comment",changed_comment );
      
        document.getElementById(feedID+'-text').value = changed_comment;
        /*hide menu*/
        var menu = document.getElementById('menu'+feedID);
        $A.util.toggleClass(menu, 'slds-hide');
    },

     //Share Item
    shareItem : function(component){
    var message = component.get("v.comment");
    var groupID = component.get("v.groupattid");
    var feedID = component.get("v.feedItemIdtest");
    console.log(message+'  '+feedID);
    var pushShareItem = component.get("c.parseChatterPostWithMentions");
    pushShareItem.setParams({
                             "msg" : message,
                             "feedId" : feedID
                           });
    pushShareItem.setCallback(this,function(response){
      var state = response.getState();
      if(state==="SUCCESS"){
        console.log("Post Success");
        document.getElementById(feedID+'-text').value = "";
        document.getElementById('show-'+feedID).classList.toggle('slds-hide');
       // component.set("v.fadeTimeout",true);
        document.getElementById('toast'+feedID).classList.toggle('slds-hide');
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    document.getElementById('toast'+feedID).classList.toggle('slds-hide');
                }
            }), 5000
        );  
        
        console.log("Post State-->"+state);
       }else {
                console.log('Problem getting feed, response state: ' + state);
            }
     });
       $A.enqueueAction(pushShareItem);
  
    },



    //Like functionality
    liketoggle: function(component,event,helper){
      console.log('Checked');
      var likepush = component.get("c.likeFeedItem");
      var feedItemID = event.srcElement.dataset.id;
      document.getElementById('spinner-'+feedItemID).classList.toggle('slds-hide');
      var groupID = component.get("v.groupattid");
      var FeedAttNew   = component.get("v.groupatt");
              // component.set("v.likeunlike",false);
       console.log('feedItemID-->'+feedItemID+'   GroupId-->'+groupID);
        likepush.setParams({
                             "groupId" : groupID,
                             "feedItemId" : feedItemID
                           });
        likepush.setCallback(this,function(response){
        //console.log(JSON.stringify(response.getReturnValue(), null,4)); 
        var state = response.getState();
        var likeObj = response.getReturnValue();
        //console.log('LikeState-->'+state);
        if(state==="SUCCESS"){

          document.getElementById('spinner-'+feedItemID).classList.toggle('slds-hide');
           document.getElementById('like-'+feedItemID).classList.toggle('slds-hide');
           document.getElementById('unlike-'+feedItemID).classList.toggle('slds-hide');
           console.log('Like Found'); 
           for (var i=0;i<likeObj.elements.length; ++i){       
                if(likeObj.elements[i].id === feedItemID){
                 component.set("v.like2",likeObj.elements[i].capabilities.chatterLikes.myLike.id);
                 console.log("like2-->"+likeObj.elements[i].capabilities.chatterLikes.myLike.id);
                }

           }
        
        } else {
                console.log('Problem getting feed, response state: ' + state);
            } 

     });
       $A.enqueueAction(likepush);
    },

    
     //Unlike
    unliketoggle: function(component,event,helper){
       console.log('inside unlike toggle');
      //console.log('Checked');
      var unlikepush = component.get("c.unlikeFeedItem");
      var feedItemID = event.srcElement.dataset.id;
      document.getElementById('spinner'+feedItemID).classList.toggle('slds-hide');
      var LikeItemID = event.srcElement.dataset.likeid;
      if(LikeItemID === "null"){
      console.log("Inside Likeid == null");
      LikeItemID = component.get("v.like2");
     }
      var groupID = component.get("v.groupattid");
       console.log('feedItemID-->'+groupID+'   LikeItemID-->'+LikeItemID);
        unlikepush.setParams({
                             "groupId" : groupID,
                             "likeId" : LikeItemID
                           });
        unlikepush.setCallback(this,function(response){
        var state = response.getState();
        console.log('UnState-->'+state);
        if(state==="SUCCESS"){ 
         // console.log(JSON.stringify(response.getReturnValue(), null,4));
          document.getElementById('spinner'+feedItemID).classList.toggle('slds-hide');
         document.getElementById('like-'+feedItemID).classList.toggle('slds-hide');
         document.getElementById('unlike-'+feedItemID).classList.toggle('slds-hide');
        //  console.log('Unlike Value'+response.getReturnValue()+ 'JSON Value'+ json);
        } else {
                console.log('Problem getting feed, response state: ' + state);
               } 

     });
       $A.enqueueAction(unlikepush);
    },
 

})