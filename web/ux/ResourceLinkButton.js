Ext.define('Ext.ux.ResourceLinkButton', {
    requires: ['Ext.ux.LinkButton'],
    alias: 'widget.nv-resourcelinkbutton',
    extend: 'Ext.ux.LinkButton',
    resource_id: null,
    text: null,
    textLink: null,
  
    handler: function (e) {
        resourceEdition = Ext.create('Netvision.view.instance.InstanceOverview', {instance_id: this.resource_id});
        resourceEdition.show();
    },
    initComponent: function(){
        this.callParent(arguments);
        this.renderTpl =  '{text}<a href="#">{textLink}</a>';
        this.renderData = {
            text: this.text,
            textLink: this.textLink
        }
    },
});

