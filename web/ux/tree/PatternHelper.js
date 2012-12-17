Ext.define('Ext.plugin.tree.PatternTreeDrag', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.nv-patterntreedrag',

    uses: [
        'Ext.tree.ViewDragZone'
    ],
    
    ddGroup : "TicketMappingHelper",
    nodeHighlightColor: 'c3daf9',
    nodeHighlightOnRepair: Ext.enableFx,

    init : function(view) {
        Ext.util.CSS.createStyleSheet(".nv-pattern-drop-field {box-shadow:0 0 10px #1e90ff;}");
        view.on('render', this.onViewRender, this, {single: true});
    },

    destroy: function() {
        Ext.destroy(this.dragZone);
    },

    onViewRender : function(view) {
        var me = this;

        me.dragZone = new Ext.tree.ViewDragZone({
            view: view,
            ddGroup: me.dragGroup || me.ddGroup,
            dragText: me.dragText,
            repairHighlightColor: me.nodeHighlightColor,
            repairHighlight: me.nodeHighlightOnRepair,
            getDragText: this.getDragText,
            onBeforeDrag: this.onBeforeDrag,
            onStartDrag: this.onStartDrag,
            afterValidDrop: this.resetTargetClass,
            afterInvalidDrop: this.resetTargetClass
        });
    },

    resetTargetClass: function(comp, e, id){
        var targets = Ext.dd.DragDropManager.getRelated(this, true);

        Ext.each(targets, function(target){
            var field = Ext.ComponentQuery.query('#' + target.id)[0];
            field.inputEl.removeCls('nv-pattern-drop-field');
        });
    },

    getDragText: function(){
        return this.dragData.records[0].data.pattern;
    },

    onStartDrag: function(x, y) {
        var targets = Ext.dd.DragDropManager.getRelated(this, true);

        Ext.each(targets, function(target){
            var field = Ext.ComponentQuery.query('#' + target.id)[0];
            field.inputEl.addCls('nv-pattern-drop-field');
        });
    },

    onBeforeDrag: function(data, e){
        var view = data.view,
            record = view.getRecord(data.item);        
       
        if(!record.data.leaf){
            return false;
        }
    }
});

Ext.define('Ext.ux.tree.PatternHelper', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.nv-ticketformatterpatternhelper',

    requires: ['Netvision.store.servicedesk.TicketMappingHelperStore'],
    store: Ext.create('Netvision.store.servicedesk.TicketMappingHelperStore'), 
    rootVisible: false,
    viewConfig: {
        plugins: {
            ptype: 'nv-patterntreedrag'
        }
    },
    height: 300,
    width: 250,
    useArrows: true,
    lines: false,
    autoScroll: true,
    bbar: {
        xtype: 'panel',
        html: gettext('Dica: arraste as propriedades para os campos do formulário.')
    }
});

Ext.define('Ext.ux.tree.MailConfigPatternHelper', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.nv-mailconfigpatternhelper',
    requires: ['Ext.data.TreeStore'],
    rootVisible: false,
    viewConfig: {
        plugins: {
            ptype: 'nv-patterntreedrag'
        }
    },
    height: 300,
    width: 250,
    useArrows: true,
    lines: false,
    autoScroll: true,
    bbar: {
        xtype: 'panel',
        html: gettext('Dica: arraste as propriedades para os campos do formulário.')
    },

    initComponent: function() {
        this.callParent(arguments);
    }
});

Ext.define('Ext.ux.tree.ServicePatternHelper', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.nv-serviceticketformatterpatternhelper',

    requires: ['Netvision.store.servicedesk.ServiceTicketMappingHelperStore'],
    store: Ext.create('Netvision.store.servicedesk.ServiceTicketMappingHelperStore'), 
    rootVisible: false,
    viewConfig: {
        plugins: {
            ptype: 'nv-patterntreedrag'
        }
    },
    height: 300,
    width: 250,
    useArrows: true,
    lines: false,
    autoScroll: true,
    bbar: {
        xtype: 'panel',
        html: gettext('Dica: arraste as propriedades para os campos do formulário.')
    }
});
