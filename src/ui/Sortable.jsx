import {
    DragDropProvider,
    DragDropSensors,
    DragOverlay,
    SortableProvider,
    createSortable,
    closestCenter,  
    useDragDropContext,
    createDraggable,
    createDroppable,
} from "@thisbeyond/solid-dnd";
import { createSignal, For } from "solid-js";
  
const Draggable = (props) => {
    const draggable = createDraggable(props.id);
    return <div use:draggable>draggable</div>;
  };
  
  const Droppable = (props) => {
    const droppable = createDroppable(props.id);
    return <div use:droppable>droppable</div>;
  };
  
  const Sandbox = () => {
    const [, { onDragEnd }] = useDragDropContext();
  
    onDragEnd(({draggable, droppable}) => {
      if (droppable) {
        // Handle the drop. Note that solid-dnd doesn't move a draggable into a
        // droppable on drop. It leaves it up to you how you want to handle the
        // drop.
      }
    });
  
    return (
      <div>
        <Draggable id="draggable-1" />
        <Droppable id="droppable-1" />
      </div>
    );
  };
  
export const SortableHorizontalListExample = () => {
    const [items, setItems] = createSignal([1, 2, 3, 4, 5, 6, 7]);
    const [activeItem, setActiveItem] = createSignal(null);
    const ids = () => items();

    const onDragStart = ({ draggable }) => setActiveItem(draggable.id);

    const onDragEnd = ({ draggable, droppable }) => {
        if (draggable && droppable) {
            const currentItems = ids();
            const fromIndex = currentItems.indexOf(draggable.id);
            const toIndex = currentItems.indexOf(droppable.id);
            if (fromIndex !== toIndex) {
                const updatedItems = currentItems.slice();
                updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
                setItems(updatedItems);
            };
        };
        setActiveItem(null);
    };
    
    return (
        <DragDropProvider>
          <DragDropSensors>
            <Sandbox />
          </DragDropSensors>
        </DragDropProvider>
      );
};