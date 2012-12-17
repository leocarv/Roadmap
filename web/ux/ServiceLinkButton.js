Ext.define('Ext.ux.ServiceLinkButton', {
    requires: ['Ext.ux.LinkButton'],
    alias: 'widget.nv-servicelinkbutton',
    extend: 'Ext.ux.LinkButton',
    service_id: null,
    text: null,
    textLink: null,

    handler: function (e) {
        serviceEdition = Ext.create('Netvision.view.service.ServiceOverview', {service_id: this.service_id});
        serviceEdition.show();
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

