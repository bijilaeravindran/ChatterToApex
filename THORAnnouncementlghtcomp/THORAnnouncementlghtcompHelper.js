({
	toggle : function(id,state) {
        var btn = document.getElementById(state+'-'+id);
        $A.util.addClass(btn, 'slds-hide');
	},
})