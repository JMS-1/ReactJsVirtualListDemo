import * as React from 'react';
import { render } from 'react-dom';

import { List } from './list';

interface IRootProps {
}

interface IRootState {
}

const names = [];

for (let i = 0; i++ < 150;)
    names.push(`Item ${i}`);

class Root extends React.PureComponent<IRootProps, IRootState>
{
    render(): JSX.Element {
        // Man beachte, dass die angegebene Höhe im Beispiel zur CSS Klasse 'item' passen muss!
        return <List itemHeight={50}>{names.map(name => <div key={name} className='item'>{name}</div>)}</List>;
    }
}

render(<Root />, document.querySelector('em-root'));