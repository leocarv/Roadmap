/**
 * @class Ext.grid.InfinityScroller
 * @extends Ext.grid.Scroller
 */
Ext.define('Ext.ux.grid.InfinityScroller', {
    extend: 'Ext.grid.Scroller',
    alias: 'widget.infinitygridscroller',
    percentageFromEdge: 0.55,

    /**
     * @cfg {Number} scrollToLoadBuffer This is the time in milliseconds to buffer load requests
     * when scrolling the PagingScrollbar.
     */
    scrollToLoadBuffer: 200,

    activePrefetch: true,

    chunkSize: 50,
    snapIncrement: 25,

    syncScroll: true,

    initComponent: function() {
        var me = this,
            ds = me.store;
        
        me.createPagingStore();
        me.callParent(arguments);

    },

    onAdded: function(){
        /**
        * Creating events to work with PistonFiltersFeature
        * and keep grid selection.
        */
        this.callParent(arguments);

        this.ownerGrid.selectedItems = [];

        this.ownerGrid.on('afterbindstore', function(){
            this.ownerGrid.getStore().on('load', function(store, records, success, operation){
                this.ownerParams = operation.params;

                // Re select the items after load
                Ext.each(this.ownerGrid.selectedItems, function(row) {
                    var idx = store.find('id', row.data.id);
                    this.ownerGrid.getSelectionModel().select(idx, true);
                }, this);

            }, this);
        }, this);

        // Save selection to not lose after grid refresh
        this.ownerGrid.on('itemclick', function(grid, record){
            this.ownerGrid.selectedItems = this.ownerGrid.getSelectionModel().getSelection();
        }, this);
    },

    createPagingStore: function() {
        var me = this;
        var store_params = {};

        var proxyObj = {
            type: me.store.proxy.type,
            url: me.store.proxy.url,
            reader: {
                root: me.store.proxy.reader.root,
                totalProperty: me.store.proxy.reader.totalProperty || 'total'
            }
        };

        store_params = {
            proxy : proxyObj,
            pageSize : 30, //mportela: we can change this for a greater value later....
            autoLoad: false
        };

        if (me.store.fields) {
            store_params.fields = me.store.fields;
        } else {
            store_params.model = me.store.model;
        }

        me.paging_store = new Ext.data.Store(store_params);
    },

    syncTo: function() {
        var me            = this,
            pnl           = me.getPanel(),
            store         = pnl.store,
            scrollerElDom = this.scrollEl.dom,
            rowOffset     = me.visibleStart - store.guaranteedStart,
            scrollBy      = rowOffset * me.rowHeight,
            scrollHeight  = scrollerElDom.scrollHeight,
            clientHeight  = scrollerElDom.clientHeight,
            scrollTop     = scrollerElDom.scrollTop,
            useMaximum;
            

        // BrowserBug: clientHeight reports 0 in IE9 StrictMode
        // Instead we are using offsetHeight and hardcoding borders
        if (Ext.isIE9 && Ext.isStrict) {
            clientHeight = scrollerElDom.offsetHeight + 2;
        }

        // This should always be zero or greater than zero but staying
        // safe and less than 0 we'll scroll to the bottom.
        useMaximum = (scrollHeight - clientHeight - scrollTop <= 0);
        this.setViewScrollTop(scrollBy, useMaximum);
    },

    onElScroll: function(e, t) {
        var me = this,
            panel = me.getPanel(),
            //store = panel.store, //mportela
            store = me.ownerGrid.getStore(),
            pageSize = store.pageSize,
            guaranteedStart = store.guaranteedStart,
            //guaranteedEnd = store.guaranteedEnd, //mportela
            guaranteedEnd = store.getCount(),
            totalCount = store.getTotalCount(),
            numFromEdge = Math.ceil(me.percentageFromEdge * pageSize),
            position = t.scrollTop,
            visibleStart = Math.floor(position / me.rowHeight),
            view = panel.down('tableview'),
            viewEl = view.el,
            visibleHeight = viewEl.getHeight(),
            visibleAhead = Math.ceil(visibleHeight / me.rowHeight),
            visibleEnd = visibleStart + visibleAhead,
            prevPage = Math.floor(visibleStart / pageSize),
            nextPage = Math.floor(visibleEnd / pageSize) + 2,
            lastPage = Math.ceil(totalCount / pageSize) + 1,
            snap = me.snapIncrement,
            requestStart = Math.floor(visibleStart / snap) * snap,
            requestEnd = requestStart + pageSize - 1,
            activePrefetch = me.activePrefetch
            start_to_load = 0;

        me.visibleStart = visibleStart;
        me.visibleEnd = visibleEnd;
        
        
        me.syncScroll = true;
        if (totalCount >= pageSize) {
            if (visibleEnd > (guaranteedEnd - numFromEdge) && nextPage <= lastPage) {
                me.syncScroll = false;
                //store.prefetchPage(nextPage);
                start_to_load = guaranteedEnd++;
                // toda logica vai aqui... os outros ifs serão descontinuados!!!
                me.attemptLoad(start_to_load);
            }
        }

        if (me.syncScroll) {
            me.syncTo();
        }

        this.fireEvent('bodyscroll', e, t);
    },

    getSizeCalculation: function() {
        var me     = this,
            owner  = me.ownerGrid,
            view   = owner.getView(),
            store  = owner.getStore(),
            dock   = me.dock,
            elDom  = me.el.dom,
            width  = 1,
            height = 1,
            rowEl = view.el.down(view.getItemSelector());

        if (!me.rowHeight && rowEl) {
            me.rowHeight = rowEl.getHeight(false, true);
        }

        height = store.getCount() * me.rowHeight;

        if (isNaN(width)) {
            width = 1;
        }
        if (isNaN(height)) {
            height = 1;
        }
        return {
            width: width,
            height: height
        };
    },

    attemptLoad: function(start) {
        var me = this;

        if (!me.loadTask) {
            me.loadTask = Ext.create('Ext.util.DelayedTask', me.doAttemptLoad, me, []);
        }
        me.loadTask.delay(me.scrollToLoadBuffer, me.doAttemptLoad, me, [start]);
    },

    cancelLoad: function() {
        if (this.loadTask) {
            this.loadTask.cancel();
        }
    },

    doAttemptLoad:  function(start, end){
        var me = this;
        me.cancelLoad();
        
        var params = {};
        if(me.ownerParams && me.ownerParams.filter) 
            params.filter = me.ownerParams.filter;
        if(me.ownerParams && me.ownerParams.sort)
            params.sort = me.ownerParams.sort;

        me.paging_store.load(
            {
                start: start,
                scope: me,
                params: params,
                callback: me.appendResults
            }
        );
    },

    appendResults: function(records, operation, success) {
        var me = this;
        var store = me.ownerGrid.getStore();
        me.invalidate();
        store.loadData(records, true);
    },

    setViewScrollTop: function(scrollTop, useMax) {
        var me = this,
            owner = me.getPanel(),
            items = owner.query('tableview'),
            i = 0,
            len = items.length,
            center,
            centerEl,
            calcScrollTop,
            maxScrollTop,
            scrollerElDom = me.el.dom;

        owner.virtualScrollTop = scrollTop;

        center = items[1] || items[0];
        centerEl = center.el.dom;

        maxScrollTop = ((owner.store.pageSize * me.rowHeight) - centerEl.clientHeight);
        calcScrollTop = (scrollTop % ((owner.store.pageSize * me.rowHeight) + 1));
        if (useMax) {
            calcScrollTop = maxScrollTop;
        }
        if (calcScrollTop > maxScrollTop) {
            return;
        }

        for (; i < len; i++) {
            items[i].el.dom.scrollTop = calcScrollTop;
        }
    }
});

