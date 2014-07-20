/** @jsx React.DOM */

var root = {};

root.componentStore = {};

root.componentStore.SearchInput = React.createClass({
    onKeyDown: function(event) {
        if (event.key === "ArrowDown") {
            this.props.controller.setHighlightedItemRelative(true);
        } else if (event.key === "ArrowUp") {
            this.props.controller.setHighlightedItemRelative(false);
        }
    },

    queryChanged: function(event) {
        this.props.controller.onQueryChanged(event.target.value);
    },

    render: function() {
        return (
            <div style={{height: 30, width: 100}}>
                <input
                    type="text"
                    onKeyDown={this.onKeyDown}
                    onChange={this.queryChanged}
                    style={{position: "absolute", background: "transparent", zIndex: 2}} />
                <input
                    type="text"
                    value={this.props.fadedText}
                    readOnly
                    style={{color: "#CCC", position: "absolute", background: "transparent", zIndex: 1}} />
            </div>
        );
    }
});

root.componentStore.SearchDropdown = React.createClass({
    render: function() {
        var children = [];
        for (var i = 0; i < this.props.ordering.length; ++i) {
            var curName = this.props.ordering[i];
            var curConfig = this.props.datasetConfigs[curName];
            if (!curConfig) {
                throw Error("Unknown dataset " + curName + " in ordering.");
            }

            var highlightedIndex = -1;
            if (this.props.highlightedItem &&
                    curName === this.props.highlightedItem.datasetName) {
                highlightedIndex = this.props.highlightedItem.index;
            }

            children.push(
                curConfig.component({
                    ref: curName,
                    key: curName,
                    controller: this.props.controller,
                    config: curConfig,
                    query: this.props.query,
                    highlightedIndex: highlightedIndex,
                })
            );
        }

        return <div>{children}</div>;
    },

    getDatasetComponentByName: function(name) {
        return this.refs[name] || null;
    },
});

root.componentStore.Search = React.createClass({
    // props.datasetConfigs:object<
    //     name:str => configuration:object< prop:str => value:any > >
    // Configuration for each data set.

    // state.ordering:list< name:str >
    // Defines which result sets, and in which order, are displayed.

    // state.query:str
    // The currently typed in query (what is displayed to the user)

    getInitialState: function() {
        this.datasetSizes = {};

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

    onQueryChanged: function(query) {
        this.setState({query: query});
    },

    setHighlightedItemRelative: function(moveDown) {
        var that = this;
        var numItemsIn = function(name) {
            return (that.refs.dropdown
                .getDatasetComponentByName(name).numItems);
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

    setHighlightedItem: function(name, index) {
        this.setState({highlightedItem: {datasetName: name, index: index}});
    },

    render: function() {
        return (
            <div>
                <root.componentStore.SearchInput
                    ref="input"
                    controller={this}
                    query={this.state.query}
                    fadedText={this.state.fadedText} />
                <root.componentStore.SearchDropdown
                    ref="dropdown"
                    controller={this}
                    query={this.state.query}
                    datasetConfigs={this.props.datasetConfigs}
                    ordering={this.state.ordering}
                    highlightedItem={this.state.highlightedItem} />
            </div>
        );
    }
});

///////////////
// USER LAND //
///////////////

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });

    cb(matches);
  };
};

var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];
var hound = substringMatcher(states);

var StatesDataset = React.createClass({
    // onPropsChange: function(event) {
    //     console.log("searching for " + this.props.controller.query);

    //     // bloodhound_go(this.props.controller.query, function(datums) {
    //     //     this.props.controller.setDatasetResults("suggestions", datums);
    //     //     this.props.controller.dispatchEvent("custom:updateFooter")
    //     //     // this.props.controller.components["footer"].updateMaybe();
    //     // });
    // },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.props.query != prevProps.query) {
            this.doQuery();
        }
    },

    getInitialState: function() {
        return {
            results: [],
        };
    },

    setResults: function(results) {
        this.setState({results: results});
        if (results.length > 0 && results[0].value.indexOf(this.props.query) === 0) {
            this.props.controller.setState({fadedText: results[0].value});
        } else {
            this.props.controller.setState({fadedText: ""});
        }
    },

    doQuery: function() {
        hound(this.props.query, this.setResults);
    },

    render: function() {
        var renderedResults = [];
        for (var i = 0; i < this.state.results.length; ++i) {
            var isSelected = this.props.highlightedIndex === i;
            var className = isSelected ? "selected" : "";

            var that = this;
            var hover = (function(index, event) {
                that.props.controller.setHighlightedItem(that.props.key, index);
            }).bind(this, i);

            renderedResults.push(<a href="#" onMouseOver={hover} className={className}>{this.state.results[i]}</a>);
        }

        this.numItems = this.state.results.length;

        return <ul>{renderedResults}</ul>;
    }
});

var datasetConfigs = {
    states: {component: StatesDataset},
};

React.renderComponent(
    root.componentStore.Search({datasetConfigs: datasetConfigs}),
    document.getElementById("search-bar")
);
