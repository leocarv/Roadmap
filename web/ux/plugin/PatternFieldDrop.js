Ext.define('Ext.ux.plugin.PatternFieldDrop', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.nv-patternfielddrop',

    requires: ['Ext.dd.DropTarget'],
    
    init: function(field){
        if(!field instanceof Ext.form.field.Text){
            Ext.Error.raise("This plugin only works on Ext.form.field.Text");
        }

        field.on('afterrender', function(field){
            field.dropZone = Ext.create('Ext.dd.DropTarget', field.getEl(), {
                ddGroup: 'TicketMappingHelper',
                
                notifyDrop  : function(ddSource, e, data){
                    var dragged = data.records[0];
                    field.setValue(field.getValue() + dragged.raw.pattern);
                }
            });
        });

        field.on('destroy', function(){
            Ext.destroy(field.dropZone);
        });
    }
});
