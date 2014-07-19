/** @jsx React.DOM */

var root = {};

root.componentStore = [];

root.componentStore.SearchInput = React.createClass({
    queryChanged: function(event) {
        this.props.onQueryChanged(event.target.value);
    },

    render: function() {
        return <input type="text" onChange={this.queryChanged} />;
    }
});

// root.componentStore.SearchDatasetMixin = {
//     render: function() {
//         return (
//             <div>MOOOO</div>
//         );
//     }
// };

root.componentStore.SearchDropdown = React.createClass({
    render: function() {
        var children = [];
        for (var i = 0; i < this.props.ordering.length; ++i) {
            var curName = this.props.ordering[i];
            var curConfig = this.props.datasetConfigs[curName];
            if (!curConfig) {
                throw Error("Unknown dataset " + curName + " in ordering.");
            }
            children.push(
                curConfig.component({
                    key: curName,
                    config: curConfig,
                    query: this.props.query,
                })
            );
        }

        return <div>{children}</div>;
    }
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
        // The default ordering is alphabetic
        var ordering = _.map(this.props.datasetConfigs, function(v, k) {
            return k;
        });
        ordering.sort();

        return {
            ordering: ordering,
            query: "",
        }
    },

    onQueryChanged: function(query) {
        this.setState({query: query});
    },

    render: function() {
        return (
            <div>
                <root.componentStore.SearchInput
                    onQueryChanged={this.onQueryChanged}
                    query={this.state.query} />
                <root.componentStore.SearchDropdown
                    query={this.state.query}
                    datasetConfigs={this.props.datasetConfigs}
                    ordering={this.state.ordering} />
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

    componentWillReceiveProps: function(nextProps) {
        console.log(nextProps);
        if (this.props.query != nextProps.query) {
            this.doQuery();
        }
    },

    getInitialState: function() {
        return {
            results: [],
        };
    },

    setResults: function(results) {
        this.state.results = results;
    },

    doQuery: function() {
        hound(this.props.query, this.setResults.bind(this));
    },

    render: function() {
        var renderedResults = this.state.results.map(function(result) {
            return <li>{result}</li>
        })

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
