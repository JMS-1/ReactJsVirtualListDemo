export interface IViewModelProps<TViewModelType> {
    readonly vm: TViewModelType;
}

export interface IVirtualListSite {
    refresh(): void;
}

export interface IVirtualList {
    readonly itemsViewModel: IVirtualListItems;

    readonly sliderViewModel: IVirtualListSlider;

    disconnect(): void;
}

export interface IVirtualListItems {
    readonly start: number;

    readonly count: number;

    setTotal(newTotal: number): void;

    setHeight(newHeight: number): void;
}

export interface IVirtualListSlider {
    setPosition(relPosition: number): void;

    readonly sliderHeight: number;

    readonly sliderPosition: number;

    startDrag(x: number, y: number, left: number, top: number, width: number, height: number): void;

    drag(x: number, y: number): void;

    endDrag(): void;
}

export default class implements IVirtualList, IVirtualListItems, IVirtualListSlider {
    constructor(private readonly _itemHeight: number, private _site: IVirtualListSite) {
    }

    disconnect(): void {
        this._site = undefined;
    }

    get itemsViewModel(): IVirtualListItems {
        return this;
    }

    get sliderViewModel(): IVirtualListSlider {
        return (this.count < this._total) ? this : null;
    }

    // Die Anzahl der Elemente.
    private _total = 0;

    // Legt die gesamte Anzahl der Elemente fest.
    setTotal(newTotal: number): void {
        // Das wissen wir schon.
        if (newTotal === this._total)
            return;

        // Wert übernehmen.
        this._total = newTotal;

        // Anzeige aktualisieren.
        this._site.refresh();
    }

    // Die laufende Nummer des ersten anzuzeigenden Elementes.
    start = 0;

    // Meldet eine neue Position des Schiebers.
    setPosition(relPosition: number): void {
        // Wir haben gar keine Daten.
        if (this._total < 1)
            return;

        // Aktuelle relative Position ermitteln.
        const sliderStart = this.sliderPosition / 100;
        const sliderHeight = this.sliderHeight / 100;

        // Nach oben.
        if (relPosition < sliderStart)
            this.moveTo(Math.max(0, sliderStart - sliderHeight));
        else if (relPosition > (sliderStart + sliderHeight))
            this.moveTo(Math.min(1, sliderStart + sliderHeight));
    }

    private moveTo(relPosition: number): void {
        // Relative Position in das zughörige Element umrechnen - wir achten darauf, dass der Schieber nicht aus der Liste rutscht.
        var start = Math.max(0, Math.min(this._total - 1, Math.floor(Math.min(1 - this.sliderHeight / 100, relPosition) * this._total)));

        // Es hat nicht nichts verändert.
        if (start === this.start)
            return;

        // Neuen Wert übernehmen.
        this.start = start;

        // Anzeige erneuern.
        this._site.refresh();
    }

    // Die Anzahl der angezeigten Elemente.
    count = 0;

    // Setzt die Höhe der Liste.
    setHeight(newHeight: number): void {
        // Wieviele Elemente passen da hinein?
        const count = Math.ceil(newHeight / (this._itemHeight));

        // Es hat sich nichts verändert.
        if (count === this.count)
            return;

        // Neue Anzahl merken.
        this.count = count;

        // Eventuell verrutscht der Schieber nun noch.
        if (this._total > 0)
            this.moveTo(this.start / this._total);

        // Anzeige auf jeden Fall aktualisieren.
        this._site.refresh();
    }

    // Ermittelt die relative Größe des Schiebers.
    get sliderHeight(): number {
        // Wenn wir keine Daten haben geht der Schieber über den gesamten Bereich.
        if (this._total < 1)
            return 100;

        // Die Größe des Schiebers ergibt sich leicht aus der angezeigten Anzahl von Elementen.
        return Math.max(1, Math.min(100, 100 * this.count / this._total));
    }

    // Ermittelt die relative Position des Schiebers.
    get sliderPosition(): number {
        // Wir haben gar keine Daten.
        if (this._total < 1)
            return 0;

        // Der Schieber verläßt niemals den Bereich des Balkens, ansonsten ist die Berechnung trivial.
        return 100 * Math.min(1 - this.sliderHeight / 100, this.start / this._total);
    }

    // Enthält den Punkt an dem auf den Schieber geklickt wurde.
    private _dragStart: { x: number; y: number; left: number; top: number; width: number; height: number; start: number; }

    // Beginnt mit dem Verschieben des Schiebers.
    startDrag(x: number, y: number, left: number, top: number, width: number, height: number): void {
        // Wir haben gar keine Daten.
        if (this._total < 1)
            return;

        // Kontext merken.
        this._dragStart = { x, y, left, top, width, height, start: this.start };
    }

    // Beendet das Verschieben des Schiebers.
    endDrag(): void {
        // Kontext vergessen.
        this._dragStart = undefined;
    }

    // Meldet die Position der Maus.
    drag(x: number, y: number): void {
        // Wir ziehen gerade gar nicht.
        if (!this._dragStart)
            return;

        // Wird nur berücksichtigt, wenn sich das noch im Bereich des Balkens befindet.
        if ((this._dragStart.top - y) > 20)
            return;
        if ((y - (this._dragStart.top + this._dragStart.height)) > 20)
            return;
        if ((this._dragStart.left - x) > 40)
            return;
        if ((x - (this._dragStart.left + this._dragStart.width)) > 40)
            return;

        // Verschiebung ermitteln.
        const delta = (y - this._dragStart.y) / this._dragStart.height;

        // Anwenden.
        this.moveTo(this._dragStart.start / this._total + delta);
    }
}