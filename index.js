import { Component } from 'react';
import { AppState, NetInfo } from 'react-native';

const defaultOptions = {
    fetchFunc: 'fetchData',
    handleAppState: true,
    onResumeDelay: 1000 * 60 * 5
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
        NetInfo.removeEventListener('connectionChange', this._onNetworkChange);
    }

    get resumeDelayElapsed () {
        return this._inactiveTime + this.options.onResumeDelay <= Date.now();
    }

    handleState (appState) {
        if (appState === 'inactive') {
            this._inactiveTime = Date.now();
        }
        if (appState === 'active' && this.resumeDelayElapsed) {
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
                    if (connectivity.type.toLowerCase() !== 'none') {
                        this._fetchFunc && this._fetchFunc();
                    }
                };
                NetInfo.addEventListener('connectionChange', this._onNetworkChange);
            });
        }
    }
}
