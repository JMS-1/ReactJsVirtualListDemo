import * as React from 'react';

interface IListProps {
    itemHeight: number;
}

interface IInternalListProps {
    relStart: number;

    onCountChanged(visible: number, total: number): void;
}

interface IListState {
    count: number;

    total: number;
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
        const children = React.Children.toArray(this.props.children) || [];

        this.setState({ total: children.length });

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
        const stateCount = this.state ? this.state.count : -1;

        if (count === stateCount)
            return;

        this.setState({ count });

        this.props.onCountChanged(count, this.state.total);
    }
}

interface IScrollProps {
    relKnobSize: number;

    relKnobPos: number;

    moveTo(relPos: number): void;
}

interface IScrollState {
}

class Scroll extends React.PureComponent<IScrollProps, IScrollState>{
    render(): JSX.Element {
        const relKobPos = Math.min(this.props.relKnobPos, 100 - this.props.relKnobSize);

        return <div className='istk-list-scroll' onClick={this.onClick}><div /><div style={{ height: `${this.props.relKnobSize}%`, top: `${relKobPos}%` }} /></div>;
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

interface IInternalListState {
    relStart: number;
}

export default class extends React.PureComponent<IListProps, IListState & IInternalListState> {
    render(): JSX.Element {
        const relKnobSize = (this.state && (this.state.total !== undefined) && (this.state.total > 0)) ? Math.max(1, Math.min(100, 100 * this.state.count / this.state.total)) : 0;
        const relStart = Math.min(1 - relKnobSize / 100, (this.state && this.state.relStart) || 0);
        const relKnobPos = (this.state && (this.state.total !== undefined) && (this.state.total > 0)) ? Math.max(0, Math.min(100, 100 * Math.floor(relStart * this.state.total) / this.state.total)) : 0;

        return <div className='istk-list'>
            <div>
                <List {...this.props} relStart={relStart} onCountChanged={this.setCount} />
                <Scroll moveTo={this.moveTo} relKnobSize={relKnobSize} relKnobPos={relKnobPos} />
            </div>
        </div>;
    }

    private setCount = (count: number, total: number) => {
        if (!this.state || (count !== this.state.count) || (total !== this.state.total))
            this.setState({ count, total });
    };

    private moveTo = (relStart: number) => {
        if (!this.state || (relStart !== this.state.relStart))
            this.setState({ relStart });
    }
}