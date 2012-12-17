Ext.define('Ext.ux.tab.EnhancedPanel', {
    extend: 'Ext.Container',
    layout: 'border',
    alias: 'widget.enhancedtab',

    tabCls: '',
    enableFx: true,
    tabbarConfig: {},

    getTabBar: function(){
        return this.tabbar;
    },
    
    /**
     * @protected
     */ 
    getPanel: function(){
        return this.tabpanel;
    },

    addTab: function(component){
        var obj = this.getPanel().add(component);
        if(!Ext.isArray(obj)){
            obj = [obj];
        }
        var tabbar = this.getTabBar();
        var tabbarStore = tabbar.getStore();

        obj = Ext.isArray(obj)? obj: [obj];
        obj.forEach(function(v,k,all){
            tabbarStore.add({
                ref: v
            });

            v.on('beforedestroy', function(cmp){
                var anim = cmp.getActiveAnimation();
                if(anim){
                    cmp.stopAnimation();
                }
            });

            v.on('titlechange', function(){
                this.getTabBar().refresh();
            }, this);

            v.on('destroy', function(cmp){
                var idx = tabbarStore.findExact('ref', cmp);
                tabbarStore.removeAt(idx);
            }, this);
        }, this);

        if(tabbar.getSelectionModel().getCount() == 0 && obj.length > 0){
            if(this.rendered){
                tabbar.getSelectionModel().select(0);
            }
            else{
                this.on('afterrender', function(){
                    tabbar.getSelectionModel().select(0);
                });
            }
        }
        return obj.length == 1 ? obj[0]: obj;
    },

    getActiveTab: function(){
        return this.getPanel().getLayout().getActiveItem();
    },

    remove: function(a) {
        alert('Removido ' + a);
    },

    _setActiveTab: function(a){
        a = this.getPanel().getComponent(a);
        if (!a) return;
        var layout = this.getPanel().getLayout();
        var currItem = layout.getActiveItem();
        var ret = a;

        if(this.enableFx)
        {
            a.stopAnimation();
            currItem.stopAnimation();

            a.animate({
                duration: 1,
                to: {opacity: 0}
            })
            currItem.animate({
                duration: 500,
                to:{
                    opacity: 0
                },
                listeners: {
                    afteranimate: function() {
                        layout.setActiveItem(a);
                        a.animate({
                            to: {opacity: 1}
                        });
                    },
                    scope: this
                }
            });
        }
        else
        {
            layout.setActiveItem(a);
        }
        return ret;
    },

    setActiveTab: function(a){
        a = this._setActiveTab(a);
        if (!a) return;
        var idx = this.tabbar.getStore().findExact('ref', a);
        this.tabbar.getSelectionModel().select(idx);
        return a;
    },

    initComponent: function(){
        var initialTabs = this.items ? this.items : [];
        var tabbarConfig = {
            xtype: 'dataview',
            itemId: 'tabbar',
            cls: 'enhanced-tab-bar ' + this.tabCls,
            width: 200,
            singleSelect: true,
            maintainFlex: true,
            autoScroll: true,
            tpl: [
            '<ul><tpl for=".">',
                '<li>{ref.title}</li>', 
            '</tpl></ul>'
            ],
            store: Ext.create('Ext.data.Store', {fields: ['ref'], proxy: 'memory', data:[]}),
            itemSelector: 'li',
            region: 'west'
        };
        Ext.apply(tabbarConfig, this.tabbarConfig);

        this.items = [
            tabbarConfig,
            {
                defaults: {
                    xtype: 'panel',
                    preventHeader: true
                },
                xtype: 'panel',
                itemId: 'tabpanel',
                layout: 'card',
                bodyPadding: 10,
                region: 'center'
            }
        ];

        this.callParent(arguments);
        this.tabbar = this.getComponent('tabbar');
        this.tabpanel = this.getComponent('tabpanel');

        this.tabbar.on('selectionchange', function(view, selection, opt){
            if(selection.length == 0){
                this.setActiveTab(0);
            }
            else
            {
                var tab = selection[0].data.ref;
                this._setActiveTab(tab);
            }

        }, this);

        // Prevent the null selection
        this.tabbar.on('beforecontainerclick', function(){
            return false;
        }, this);

        // Select the first tab
        this.tabbar.on('afterrender', function(){
            if(this.tabbar.getStore().getCount() > 0){
                this.tabbar.select(0, false, true);
            }
        }, this);

        this.addTab(initialTabs);
    }

});
