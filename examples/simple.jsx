/** @jsx React.DOM */

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

// constructs the suggestion engine
var stateHound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // `states` is an array of state names defined in "The Basics"
    local: $.map(states, function(state) { return { value: state }; })
});
 
// kicks off the loading/processing of `local` and `prefetch`
stateHound.initialize();

var StatesDataset = React.createClass({
    mixins: [
        searchbar.mixins.BaseDataset,
        searchbar.mixins.BloodhoundDataset(stateHound.ttAdapter(), true)],

    render: function() {
        var renderedResults = [];
        for (var i = 0; i < this.state.results.length; ++i) {
            var isSelected = this.props.highlightedIndex === i;
            var className = isSelected ? "selected" : "";

            var highlighted = searchbar.utils.highlight(
                this.state.results[i].value,
                Bloodhound.tokenizers.whitespace(this.props.query),
                "<b>",
                "</b>"
            );

            renderedResults.push(
                <a
                    href="#"
                    onMouseOver={this.getHoverHandler(i)}
                    className={className}
                    dangerouslySetInnerHTML={{__html: highlighted}}></a>
            );
        }

        this.numItems = this.state.results.length;

        return <div>{renderedResults}</div>;
    }
});

var datasetConfigs = {
    states: {component: StatesDataset},
};

React.renderComponent(
    searchbar.componentStore.Search({datasetConfigs: datasetConfigs}),
    document.getElementById("searchbar-the-basics")
);
