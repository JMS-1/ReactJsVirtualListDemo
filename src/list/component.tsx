import * as React from 'react';

/*
  Wie man sehr schön sieht, enthält die Anzeige der virtuellen Liste keine wirkliche
  Fachlogik zur Darstellung der Elemente und des Schiebereglers. Einzig erwähnenswert
  sind ein paar Zeilen Code, mit deren Hilfe Interaktionen (e.g. Klicken mit der Maus)
  in geeigneter (i.a. relativer) Form an die Steuerung übertragen wird. Die React.Js
  Komponenten in diesem Modul sind tatsächlich nur nackte Anzeigesklaven, selbst
  die Aktualisierung wird explizit durch die Steuerung angestossen.
*/

// Die einzelnen Elemente der Steuerung - da lässt sich sicher noch etwas Struktur hineinbringen!
import VirtualListController, { IVirtualListController, IView, IVirtualListItemController, IVirtualListSliderController, IViewProps } from './controller';

// Kleine Hilfsschnittstelle: wir wollen tatsächlich keinen (React.Js Komponenten-) Zustand haben.
interface INoState {
}

// Die React.Js Komponente zur Anzeige der Elemente in einer einfachen Liste - wir sind sogar so faul und erwarten, dass die Kinder alle brav als block dargestellt werden.
class List extends React.Component<IViewProps<IVirtualListItemController>, INoState>{

    // An dem Container messen wir die zur Verfügung stehende Höhe.
    private _outer: HTMLDivElement;

    // Erstellt die Elemente der Anzeige.
    render(): JSX.Element {
        // Erst einmal alle untergeordneten React.Js Komponenten.
        const children = React.Children.toArray(this.props.children) || [];

        // Wir zeigen aber nur die an, die voin der Steuerung erlaubt werden.
        return <div className='istk-list-items' ref={e => this._outer = e}>
            {children.slice(this.props.ctl.start, this.props.ctl.start + this.props.ctl.count)}
        </div>;
    }

    // Die React.Js Komponente wird ins DOM gehängt.
    componentWillMount(): void {
        // Die Steuerung sollte nun wissen, wieviele Elemente es gibt.
        this.props.ctl.setTotal(React.Children.count(this.props.children));

        // Der brutalste Weg die angezeigte Höhe zu ermitteln.
        window.addEventListener('resize', this.recalculateCount);
    }

    // Die React.Js Komponente wird aus dem DOM entfernt.
    componentWillUnmount(): void {
        // Da müssen wir uns aber auch wieder ausklinken.
        window.removeEventListener('resize', this.recalculateCount);
    }

    // Nach dem endgültigen Einklinken ins DOM sagen wir der Steuerung Bescheid.
    componentDidMount(): void {
        this.recalculateCount();
    }

    // Die Steuerung wird über die aktuelle Anzeigehöhe informiert.
    private recalculateCount = () => this.props.ctl.setHeight(this._outer.clientHeight);
}

// Die React.Js Komponente zur Anzeige des Schiebebalkens.
class Scroll extends React.Component<IViewProps<IVirtualListSliderController>, INoState>{

    // Erstellt die Elemente der Anzeige.
    render(): JSX.Element {
        // Wir machen einfach blind was die Steuerung uns sagt - sofern eine solche überhaupt existiert.
        return this.props.ctl &&
            <div className='istk-list-scroll' onClick={this.onClickToMove}>
                <div />
                <div style={{ height: `${this.props.ctl.sliderHeight}%`, top: `${this.props.ctl.sliderPosition}%` }} onMouseDown={this.onClickToDrag} />
            </div>;
    }

    // Beim Klicken mit der Maus rechnen wir das in eine relative Position um - hier wird es dann lästig, wenn Touch ins Spiel kommt (das gilt natürlich auch für das Drag&Drop).
    private onClickToMove = (ev: React.MouseEvent<HTMLDivElement>) => {
        ev.preventDefault();

        // Absolute Position relativ zu unserer Anzeige.
        const y = ev.pageY - ev.currentTarget.offsetTop;
        if (y < 0)
            return;

        // Gesamte Höhe der Anzeige.
        const h = ev.currentTarget.clientHeight;
        if (y > h)
            return;

        // Relative Position an die Steuerung geben.
        this.props.ctl.onClick(y / h);
    }

    // Beim Klicken auf den Schieberegler beginnen wir mit dem Verschieben.
    private onClickToDrag = (ev: React.MouseEvent<HTMLDivElement>) => {
        ev.preventDefault();

        // Neben den absoluten Koordination der Maus erhält die Steuerung das Rechteck unsere Anzeige.
        const parent = ev.currentTarget.parentElement;

        this.props.ctl.startDrag(ev.pageX, ev.pageY, parent.offsetLeft, parent.offsetTop, parent.offsetWidth, parent.offsetHeight);
    }

    // Beim Beenden eines Klicks sagen wir der Steuerung Bescheid.
    private onStopDrag = (ev: MouseEvent) => {
        this.props.ctl.endDrag();
    }

    // Jede Mausposition wird der Steuerung gemeldet - die diese im Allgemeinen sehr schnell ignoriert.
    private onDrag = (ev: MouseEvent) => {
        this.props.ctl.drag(ev.pageX, ev.pageY);
    }

    // Beim Einbinden in das DOM melden wird uns für die Mausereignisse an.
    componentWillMount(): void {
        window.addEventListener('mouseup', this.onStopDrag);
        window.addEventListener('mousemove', this.onDrag);
    }

    // Beim Ausklinken müssen wir das natürlich rückgängig machen.
    componentWillUnmount(): void {
        window.removeEventListener('mouseup', this.onStopDrag);
        window.removeEventListener('mousemove', this.onDrag);
    }

}

// Nur das hier brauchen wir für unsere virtuelle Liste - die Kinder sind React.Js Kompontenten: das könnte man auch noch mit einer Factory optimieren!
interface IListProps {
    // Die feste Höhe eines jeden Listenelementes.
    itemHeight: number;
}

// Die virtuelle Liste als React.Js Komponente.
export default class extends React.Component<IListProps, INoState> {

    // Unsere Steuerung.
    private _controller: IVirtualListController;

    // Erstellt die Anzeigelemente der virtuellen Liste.
    render(): JSX.Element {
        return <div className='istk-list'>
            <div>
                <List ctl={this._controller.itemsController} children={this.props.children} />
                <Scroll ctl={this._controller.sliderController} />
            </div>
        </div>;
    }

    // Beim Einklinken in das DOM erstellen wir unsere Steuerung.
    componentWillMount(): void {
        this._controller = new VirtualListController(this.props.itemHeight, { refresh: this.forceUpdate.bind(this) });
    }

    // Beim Ausklinken lösen wir diese Verbindung in beiderseitigem Einverständnis.
    componentWillUnmount(): void {
        if (this._controller) {
            this._controller.disconnect();
            this._controller = undefined;
        }
    }
}