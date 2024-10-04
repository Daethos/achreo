import { Form } from "solid-bootstrap";
import { font } from "../utility/styling";
import { CharacterSheet } from "../utility/ascean";
import { Accessor, Setter } from "solid-js";

export default function Character({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    return <div class='center creature-heading fadeIn' style={{ 'margin': '10% auto 5%' }}>
        <h1 style={{ 'font-size': '1em' }}>
            Name <Form.Control style={font('1em', 'black')} type="text" placeholder="Enter Name Here" id="ascean" name="ascean" value={newAscean()?.name} oninput={(e) => setNewAscean({ ...newAscean(), name: e.currentTarget.value })} /><br />
        </h1>
        <h2>
            Description <Form.Control style={font('1em', 'black')} type="text" placeholder="What are they like?" id="description" name="description" value={newAscean()?.description} oninput={(e) => setNewAscean({ ...newAscean(), description: e.currentTarget.value })} /><br />    
        </h2>
    </div>;
};