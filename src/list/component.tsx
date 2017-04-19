import * as React from 'react';

interface IListProps {
    itemHeight: number;
}

interface IInternalListProps {
    relStart: number;
}

interface IListState {
    count: number;
}

interface IInternalListState {
    relStart: number;
}

class List extends React.PureComponent<IListProps & IInternalListProps, IListState>{
    private _outer: HTMLDivElement;

    render(): JSX.Element {
        const children = React.Children.toArray(this.props.children) || [];
        const start = this.props.relStart * children.length;
        const count = this.state ? this.state.count : 0;

        return <div className='istk-list-items' ref={e => this._outer = e}>{children.slice(start, start + count)}</div>;
    }

    componentWillMount(): void {
        window.addEventListener('resize', this.recalculateCount);
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.recalculateCount);
    }

    componentDidMount(): void {
        this.recalculateCount();
    }

    private recalculateCount = () => {
        const size = this._outer.clientHeight;
        const count = Math.ceil(size / (this.props.itemHeight));
        const stateCount = this.state ? this.state.count : 0;

        if (count !== stateCount)
            this.setState({ count });
    }
}

interface IScrollProps {
    moveTo(relPos: number): void;
}

interface IScrollState {
}

class Scroll extends React.PureComponent<IScrollProps, IScrollState>{
    render(): JSX.Element {
        return <div className='istk-list-scroll' onClick={this.onClick}>&nbsp;</div>;
    }

    private onClick = (ev: React.MouseEvent<HTMLDivElement>) => {
        ev.preventDefault();

        const y = ev.pageY - ev.currentTarget.offsetTop;
        if (y < 0)
            return;

        const h = ev.currentTarget.clientHeight;
        if (y > h)
            return;

        this.props.moveTo(y / h);
    }
}

export default class extends React.PureComponent<IListProps, IListState & IInternalListState> {
    render(): JSX.Element {
        return <div className='istk-list'>
            <div>
                <List {...this.props} relStart={this.state ? this.state.relStart : 0} />
                <Scroll moveTo={this.moveTo} />
            </div>
        </div>;
    }

    private moveTo = (relStart: number) => {
        if (!this.state || (relStart != this.state.relStart))
            this.setState({ relStart });
    }
}