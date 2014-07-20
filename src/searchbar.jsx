/** @jsx React.DOM */

var searchbar = (function () { // beginning of module

var root = {};

root.componentStore = {};
root.mixins = {};

root.componentStore.SearchInput = React.createClass({
    onKeyDown: function(event) {
        if (event.key === "ArrowDown") {
            this.props.controller.setHighlightedItemRelative(true);
        } else if (event.key === "ArrowUp") {
            this.props.controller.setHighlightedItemRelative(false);
        } else if (event.key === "Tab" && this.props.fadedText) {
            event.preventDefault();
            this.props.controller.setState({"query": this.props.fadedText});
        }
    },

    queryChanged: function(event) {
        this.props.controller.setState({"query": event.target.value});
    },

    render: function() {
        return (
            // TODO(johnsullivan): Use JQuery UI to accurately position things.
            <div className="searchbar-input-container" style={{height: 30, width: 100}}>
                <input
                    className="searchbar-foreground-input"
                    type="text"
                    value={this.props.query}
                    onKeyDown={this.onKeyDown}
                    onChange={this.queryChanged}
                    style={{position: "absolute", background: "transparent", zIndex: 2}} />
                <input
                    className="searchbar-faded-input"
                    type="text"
                    value={this.props.fadedText}
                    readOnly
                    style={{color: "#CCC", position: "absolute", background: "transparent", zIndex: 1}} />
            </div>
        );
    }
});

root.componentStore.Search = React.createClass({
    getInitialState: function() {
        // The default ordering is alphabetic
        var ordering = _.map(this.props.datasetConfigs, function(v, k) {
            return k;
        });
        ordering.sort();

        return {
            ordering: ordering,
            query: "",
            highlightedItem: null,
        }
    },
    componentDidMount: function(){
        $(this.refs.results.getDOMNode()).position({
            my: "left top",
            at: "left bottom",
            of: $(this.refs.input.getDOMNode()),
        });
    },
    setHighlightedItemRelative: function(moveDown) {
        var that = this;

        var numItemsIn = function(name) {
            return that.refs["dataset_" + name].numItems;
        };

        var findNextDataset = function(start) {
            if (moveDown) {
                for (var i = start; i < that.state.ordering.length; ++i) {
                    if (numItemsIn(that.state.ordering[i]) !== 0) {
                        return that.state.ordering[i];
                    }
                }
            } else {
                for (var i = start; i >= 0; --i) {
                    if (numItemsIn(that.state.ordering[i]) !== 0) {
                        return that.state.ordering[i];
                    }
                }
            }

            return null;
        };

        if (this.state.highlightedItem === null) {
            var selectedSet = findNextDataset(
                moveDown ? 0: this.state.ordering.length - 1);

            if (selectedSet === null) {
                return;
            }

            this.setState({
                highlightedItem: {
                    datasetName: selectedSet,
                    index: moveDown ? 0 : numItemsIn(selectedSet) - 1,
                },
            });
        } else {
            var newIndex = this.state.highlightedItem.index + (moveDown? 1 : -1);

            if (newIndex >= 0 && newIndex < numItemsIn(this.state.highlightedItem.datasetName)) {
                // We're moving within a dataset
                this.setState({
                    highlightedItem: {
                        datasetName: this.state.highlightedItem.datasetName,
                        index: newIndex,
                    }
                });
            } else {
                // We're moving to another dataset
                var curSetIndex = $.inArray(
                    this.state.highlightedItem.datasetName,
                    this.state.ordering);
                var selectedSet = findNextDataset(curSetIndex + (moveDown ? 1 : -1));

                if (selectedSet === null) {
                    this.setState({highlightedItem: null});
                } else {
                    this.setState({highlightedItem: {
                        datasetName: selectedSet,
                        index: moveDown ? 0 : numItemsIn(selectedSet) - 1,
                    }});
                }
            }
        }
    },

    render: function() {
        var datasets = [];
        for (var i = 0; i < this.state.ordering.length; ++i) {
            var curName = this.state.ordering[i];
            var curConfig = this.props.datasetConfigs[curName];
            if (!curConfig) {
                throw Error("Unknown dataset " + curName + " in ordering.");
            }

            var highlightedIndex = -1;
            if (this.state.highlightedItem &&
                    curName === this.state.highlightedItem.datasetName) {
                highlightedIndex = this.state.highlightedItem.index;
            }

            datasets.push(
                curConfig.component({
                    ref: "dataset_" + curName,
                    key: curName,
                    controller: this,
                    config: curConfig,
                    query: this.state.query,
                    highlightedIndex: highlightedIndex,
                })
            );
        }

        var resultsDiv = {
            position: "absolute"
        }
        return (
            <div className="searchbar-container">
                <root.componentStore.SearchInput
                    ref="input"
                    controller={this}
                    query={this.state.query}
                    fadedText={this.state.fadedText} />
                <div style={resultsDiv} ref="results" className="searchbar-dataset-container">
                    {datasets}
                </div>
            </div>
        );
    }
});

root.mixins.BaseDataset = {
    getHoverHandler: function(index) {
        var that = this;
        return function() {
            that.props.controller.setState({
                highlightedItem: {datasetName: that.props.key, index: index}});
        }
    }
};

root.mixins.BloodhoundDataset = function(source, setFadedText) { return {
    getInitialState: function() {
        return {
            results: [],
        };
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.props.query != prevProps.query) {
            this.doQuery();
        }
    },

    setResults: function(results) {
        this.setState({results: results});
        if (setFadedText && results.length > 0) {
            this.props.controller.setState({fadedText: results[0].value});
        } else {
            this.props.controller.setState({fadedText: ""});
        }
    },

    doQuery: function() {
        source(this.props.query, this.setResults);
    },
}};

return root;
})(); // end of module
