Ext.define('Ext.ux.TicketLinkButton', {
    requires: ['Ext.ux.LinkButton'],
    alias: 'widget.nv-TicketLinkButton',
    extend: 'Ext.ux.LinkButton',
    ticket_id: null,

    set_ticket_id: function (ticket_id) {
        this.ticket_id = ticket_id;
        this.update(this.renderTpl.apply({text:ticket_id}))
    },
    
    handler: function (e) {
        tkt = Ext.create('Netvision.view.servicedesk.TicketOverview', {ticket_id: this.ticket_id});
        tkt.show();
    }
});

