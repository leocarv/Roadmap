Ext.define('Ext.ux.LinkButton', {
    alias: 'widget.nv-linkbutton',
    extend: 'Ext.Component',
    renderTpl: '<a href="#">{text}</a>',
    renderSelectors: {
        linkEl: 'a'
    },

    initComponent: function() {
        this.callParent();
        this.addEvents('click');
        this.renderData = {
            text: this.text
        }
    },

    listeners: {
        render: function (c) {
            c.el.on('click', function(e){
                var me = this,
                    handler = me.handler;
                me.fireEvent('click', me, e);
                if (handler) {
                    handler.call(me.scope || me, me, e);
                }
            }, c);
        },
    },

    handler: function (e) {
    }
});
