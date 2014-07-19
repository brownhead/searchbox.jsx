/** @jsx React.DOM */

var SearchInputComponent = React.createClass({
    render: function() {
        return <input type="text" />;
    }
});

var SearchResultsComponent = React.createClass({
    render: function() {
        var children = [];
        for (var i = 0; i < this.props.ordering.length; ++i) {
            var curName = this.props.ordering[i];
            var curDataset = this.props.datasetConfigs[curName];
            if (!curDataset) {
                throw Error("Unknown dataset " + curName + " in ordering.");
            }
            children.push(
                curDataset.component({
                    key: curName,
                    dataset: curDataset,
                    results: this.props.datasetResults[curName] || [],
                })
            );
        }

        return <div>{children}</div>;
    }
});

var Bla = React.createClass({
    render: function() {
        return (
            <ul>
                {this.props.results.map(function(result) {
                    return <li>{result}</li>
                })}
            </ul>
        );
    }
});

var SearchComponent = React.createClass({
    getInitialState: function() {
        return {
            // object< name:str => configuration:object< prop:str => value:any > >
            // Configuration for each data set.
            datasetConfigs: {},

            // object< name:str => results:list<any> >
            // The actual results we are or will be displaying.
            datasetResults: {},

            // list< name:str >
            // Defines which result sets, and in which order, are displayed.
            ordering: [],
        };
    },

    handleChange: function(event) {
        this.setState({value: event.target.value});
    },

    render: function() {
        return (
            <div>
                <SearchInputComponent />
                <SearchResultsComponent
                    datasetConfigs={this.state.datasetConfigs}
                    datasetResults={this.state.datasetResults}
                    ordering={this.state.ordering} />
            </div>
        );
    }
});

var Controller = function($container, datasetConfigs) {
    var self = this;

    if ($container.length != 1) {
        throw Error("$container must contain a single element.");
    }

    self.render = function() {
        React.renderComponent(
            <SearchComponent />,
            $container[0]
        );
    };

    self.addDatasetConfig = function(name, config) {
        self.datasetConfigs[name] = config;
    }
}

var datasetConfigs = [
    {component: Bla, name: "suggestions"},
    {component: Bla, name: "dynamic"},
]

var myController = new Controller($("#search-bar"), datasetConfigs);
myController.render();
