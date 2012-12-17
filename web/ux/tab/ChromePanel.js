Ext.define('Ext.ux.tab.ChromePanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.chrometabpanel',
    cls: 'chrome-tabpanel',

    /**
     * @private
     */
    newTab: false,

    defaultItem: null,
    defaults: {
        closable: true
    },
    emptyTabText: gettext('Clique no {0} para adicionar um item'),

    getAddTab: function(){
        return this.tabBar.items.last();
    },

    addDefaultItem: function(){
        var nItem = this.add(this.defaultItem);
        this.newTab = nItem;

        if(this.getActiveTab().tab == this.getAddTab()){
            this.setActiveTab(nItem);
        }
    },

    doRemove: function(item, autoDestroy) {
        var me = this,
            items = me.items,
            hasItemsLeft = items.getCount() > 1;

        if (me.destroying || !hasItemsLeft) {
            me.activeTab = null;
        } else if (item === me.activeTab) {
             me.setActiveTab(item.prev() || items.getAt(0));
        }
        me.callParent(arguments);
    },

    add: function(){
        var args = Array.prototype.slice.call(arguments),
            index = this.items.length - 1,
            cmp = null;

        if(index == -1){
            index = this.items.length;
        }

        if (typeof args[0] == 'number') {
            index = args.shift();
        }
        cmp = args[0];
        return this.callParent([index, cmp]);
    },

    /**
     * Ctrl + c, Ctrl + v from ExtJS
     */ 
    removeAll: function (autoDestroy) {
        var me = this,
            removeItems = me.items.items.slice(),
            items = [],
            i = 0,
            len = removeItems.length,
            item;

        // Suspend Layouts while we remove multiple items from the container
        me.suspendLayout = true;
        for (; i < len; i++) {
            item = removeItems[i];

            // This is the new line
            if(item.isChromeAddButton) continue;

            me.remove(item, autoDestroy);

            if (item.ownerCt !== me) {
                items.push(item);
            }
        }

        // Resume Layouts now that all items have been removed and do a single layout (if we removed anything!)
        me.suspendLayout = false;
        if (len) {
            me.doLayout();
        }
        return items;
    },

    initComponent: function(){
        if(!this.defaultItem){
            Ext.Error.raise("'defaultItem' is a mandatory attr");
        }
        
        this.callParent(arguments);

        var title = Ext.String.format("<div class='empty-tab'><span class='block'>{0}</span></div>", this.emptyTabText);
        if(title.indexOf('{0}') > -1){
            title = Ext.String.format(title, '<span class="chrome-tab-add-icon" style="display: inline-block; width: 20px;">&nbsp;</span>');
        }

        var addItemTab = {
            xtype: 'panel',
            tabConfig:{
                iconCls: 'chrome-tab-add-icon',
                padding: 0,
                width: 33,
                height: 21,
                scope: this,
                handler: this.addDefaultItem
            },
            isChromeAddButton: true,
            bodyPadding: 20,
            closable: false,
            html: title
        };
        this.add(-1, addItemTab);

        this.on('beforetabchange', function(tabpanel, newTab, oldTab){
            if(newTab.tab==this.getAddTab()){
                if(this.newTab){
                    this.suspendEvents(false);
                    this.setActiveTab(this.newTab);
                    this.newTab = null;
                    this.resumeEvents();
                    return false;
                }
            }
        });
    }
});
