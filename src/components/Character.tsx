import { Form } from "solid-bootstrap";
import { font } from "../utility/styling";
import { CharacterSheet } from "../utility/ascean";
import { Accessor, Setter } from "solid-js";

export default function Character({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    return <div class='center creature-heading' style={{ 'margin-bottom': '3%' }}>
        <Form.Group><h1>Name</h1>
            <Form.Control style={font('1em', 'black')} type="text" placeholder="Enter Name Here" id="ascean" name="ascean" value={newAscean()?.name} oninput={(e) => setNewAscean({ ...newAscean(), name: e.currentTarget.value })} /><br />
        </Form.Group>
        <Form.Group><h2>Description</h2>
            <Form.Control style={font('1em', 'black')} type="text" placeholder="What are they like?" id="description" name="description" value={newAscean()?.description} oninput={(e) => setNewAscean({ ...newAscean(), description: e.currentTarget.value })} /><br />    
        </Form.Group>
    </div>;
};