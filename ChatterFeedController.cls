/*
   Name:            ChatterFeedController.cls
   Requirement ID:
   Description:     Class to get the Chatter details from Salesforce using Chatter REST API 
                                         
  Version   | Author-Email               | Date         | Comment
============|============================|==============|===================== 
1.0         | Bijil Ravindran            | 10.03.2017   | initial version
*/
global with sharing class ChatterFeedController {
    
    
    public Id   m_subjectid                 {get;set;}
    public Id   m_communityid               {get;set;}
	
    
    public static final String communityId = Network.getNetworkId(); 

    @AuraEnabled
    global static CSHDefaultValues__c getHiearchySettings(){
        System.debug('CSHDefaultValues__c-->'+CSHDefaultValues__c.getInstance());
        return CSHDefaultValues__c.getInstance();
    }


    @AuraEnabled
    global static ConnectApi.FeedElementPage getFeedData(String groupId) {
        //TODO check to see if FeedElementPage has limits
        ConnectApi.FeedElementPage feedElementPage =  ConnectApi.ChatterFeeds.getFeedElementsFromFeed(communityId,ConnectApi.FeedType.Record,groupId);
        //System.debug(JSON.serializePretty('feedElementPage-->'+feedElementPage+'feedElementPage-->'));
        System.debug('feedElementPage-->'+feedElementPage+'feedElementPage-->');
        return feedElementPage;
    }


    @AuraEnabled
    global static ConnectApi.FeedElementPage likeFeedItem(String groupId,String feedItemId) {
        ConnectApi.ChatterFeeds.likeFeedElement(communityId, feedItemId);
        return getFeedData(groupId);
    }

    @AuraEnabled 
    global static ConnectApi.FeedElementPage unlikeFeedItem(String groupId,String likeId) {
        ConnectApi.ChatterFeeds.deleteLike(communityId, likeId);
        return getFeedData(groupId);
    }


    @AuraEnabled
    global static ConnectApi.MentionCompletionPage getMentionCompletionPage(String queryString, String contextId){
    	return ConnectApi.Mentions.getMentionCompletions(communityId,queryString,contextId);
    }


    @AuraEnabled 
    global Static ConnectApi.FeedElement parseChatterPostWithMentions(String feedId, String msg){
        System.debug('InsidePostMethod, msg-->'+msg);
    ConnectApi.FeedItemInput feedItemInput = new ConnectApi.FeedItemInput();     
    
    ConnectApi.MessageBodyInput messageBodyInput = new ConnectApi.MessageBodyInput();
    
    messageBodyInput.messageSegments = new List <ConnectApi.MessageSegmentInput>();
    //parse @[User Name]
    //use pattern matching group ()  so we can easily extract name later*
    Pattern p = Pattern.compile('\\@\\[([a-z|A-Z|0-9].*?)\\]'); 
    //use regex to split all all non-mentions into segments
    String [] textSegments = p.split(msg,-1);

     System.debug('textSegments-->'+textSegments);
    
    //create a pattern matcher object
    Matcher pm = p.matcher( msg );
    //all @[mentions] in order (we will need this to build the segments later**)
    List<String> mentionedNames = new List<String>{};   
    Map<String,ConnectApi.MentionSegmentInput> nameToInputMap = new Map<String,ConnectApi.MentionSegmentInput>{};
    //iterate through each @mention and build a map of unique @mentions 
    if( pm.find() ){
        do {
            //now we can extract the pattern matching group defined earlier*
            String mentionName = pm.group(1);
            //use lowercase to ensure case neutrality later***
            String lcName = mentionName.toLowerCase();
            if(!nameToInputMap.containsKey(lcName)){
                nameToInputMap.put(lcName, new ConnectApi.MentionSegmentInput());               
            }
            mentionedNames.add(lcName);
        } while(pm.find());
    }
    ConnectApi.MentionSegmentInput[] mentions = new ConnectApi.MentionSegmentInput[]{};
    //check the @[chatter names] against user Names
    for(User u: [SELECT Id, Name FROM User WHERE name IN: mentionedNames]){
        ConnectApi.MentionSegmentInput mentionSegmentInput = new ConnectApi.MentionSegmentInput();
        //making sure to fetch using lowercased name***
        nameToInputMap.get(u.Name.toLowerCase()).id = u.id;
         System.debug('NameID-->'+u.id);
        mentionSegmentInput.id = u.id;   
    }
    //check the @[chatter names] against Chatter group Names (aka CollaborationGroup)
    for(CollaborationGroup cg: [SELECT Id, Name FROM CollaborationGroup WHERE name IN: mentionedNames]){
        ConnectApi.MentionSegmentInput mentionSegmentInput = new ConnectApi.MentionSegmentInput();
        //making sure to fetch using lowercased name***
        nameToInputMap.get(cg.Name.toLowerCase()).id = cg.id;
        mentionSegmentInput.id = cg.id;  
       //List<String> subjectNames = new List<String>(cg.id);
       // String [] subjectNames = cg.id;
    }
    //shuffle the mentions back in with the text segments
    for(Integer i=0;i<textSegments.size();i++){
        ConnectApi.TextSegmentInput textSegmentInput = new ConnectApi.TextSegmentInput();
        textSegmentInput.text = textSegments[i];
        messageBodyInput.messageSegments.add(textSegmentInput);
        //due to splitting, there should always be one less mention than text segments
        if(mentionedNames.size() > i){
            // now "sandwich" the @mentions into the text Segments in their original order
            messageBodyInput.messageSegments.add(nameToInputMap.get(mentionedNames[i]));
        }
    }

            feedItemInput.subjectId = 'me';
            feedItemInput.body = messageBodyInput;
            feedItemInput.feedElementType = ConnectApi.FeedElementType.FeedItem;

            ConnectApi.FeedEntityShareCapabilityInput shareInput = new ConnectApi.FeedEntityShareCapabilityInput();
            shareInput.feedEntityId = feedId;
            ConnectApi.FeedElementCapabilitiesInput feedElementCapabilitiesInput = new
            ConnectApi.FeedElementCapabilitiesInput();
            feedElementCapabilitiesInput.feedEntityShare = shareInput;
            feedItemInput.capabilities = feedElementCapabilitiesInput;

            // Post the feed item.
            ConnectApi.FeedElement feedElement =
            ConnectApi.ChatterFeeds.postFeedElement(communityId, feedItemInput);
            return feedElement;
}

}