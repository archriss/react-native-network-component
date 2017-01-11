import { Component } from 'react';
import { AppState, NetInfo } from 'react-native';

const defaultOptions = {
    fetchFunc: 'fetchData',
    handleAppState: true
};

export default class NetworkComponent extends Component {

    constructor (props, options) {
        super(props, options);

        this.options = {
            ...defaultOptions,
            ...options
        };
        this.handleState = this.handleState.bind(this);
    }

    get _fetchFunc () {
        return this[this.options.fetchFunc];
    }

    componentDidMount () {
        if (this.options.handleAppState) {
            AppState.addEventListener('change', this.handleState);
        }
    }

    componentWillUnmount () {
        if (this.options.handleAppState) {
            AppState.removeEventListener('change', this.handleState);
        }
        NetInfo.removeEventListener('change', this._onNetworkChange);
    }

    handleState (appState) {
        if (appState === 'active') {
            this._fetchFunc && this._fetchFunc();
        }
    }

    handleNetwork () {
        if (!this._onNetworkChange) {
            NetInfo.isConnected.fetch()
            .then(isConnected => {
                if (isConnected) {
                    // If an error occured while the network was available,
                    // do not attach an event listener
                    return;
                }
                this._onNetworkChange = (connectivity) => {
                    if (connectivity.toLowerCase() !== 'none') {
                        this._fetchFunc && this._fetchFunc();
                    }
                };
                NetInfo.addEventListener('change', this._onNetworkChange);
            });
        }
    }
}
