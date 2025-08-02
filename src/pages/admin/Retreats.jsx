import FAQForm from "../../components/admin/pilgrim_retreats/FAQForm";
import FeatureForm from "../../components/admin/pilgrim_retreats/FeatureForm";
import Location from "../../components/admin/pilgrim_retreats/Location";
import MeetGuideForm from "../../components/admin/pilgrim_retreats/MeetGuideForm";
import MonthlySubscription from "../../components/admin/pilgrim_retreats/MonthlySubscription";
import OneTimePurchase from "../../components/admin/pilgrim_retreats/OneTimePurchase";
import PilgrimRetreatCard from "../../components/admin/pilgrim_retreats/PilgrimRetreatCard";
import ProgramScheduleForm from "../../components/admin/pilgrim_retreats/ProgramScheduleForm";
import RetreatDescription from "../../components/admin/pilgrim_retreats/RetreatDescription";
import SessionForm from "../../components/admin/pilgrim_retreats/SessionForm";
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MdDragIndicator } from "react-icons/md";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useDrag, useDrop } from "react-dnd";


const ItemType = "RETREAT";

function SlideItem({ slide, index, moveSlide, onEdit, onDelete, onToggle }) {
  const [, ref] = useDrop({
    accept: ItemType,
    hover: (item) => {
      if (item.index !== index) {
        moveSlide(item.index, index);
        item.index = index;
      }
    },
  });

  const [, drag] = useDrag({
    type: ItemType,
    item: { index },
  });

  return (
    <div
      ref={(node) => drag(ref(node))}
      className="flex items-center justify-between p-3 rounded-lg shadow bg-white mb-2 border"
    >
      <div className="flex items-center gap-3">
        <MdDragIndicator className="text-gray-400 cursor-move" />
        <img src={slide.image} alt="thumb" className="h-12 w-12 rounded object-cover" />
        <div>
          <p className="font-semibold">{slide.title}</p>
          <p className="text-sm text-gray-500">Link: {slide.link}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(index)}
          className={`text-xs px-3 py-1 rounded font-semibold cursor-pointer ${
            slide.active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {slide.active ? "Active" : "Inactive"}
        </button>
        <button onClick={() => onEdit(index)} className="text-blue-600"><FaEdit /></button>
        <button onClick={() => onDelete(index)} className="text-gray-600"><FaTrash /></button>
      </div>
    </div>
  );
}

export default function Retreats() {
   const [items, setItems] = useState([]);
   const [formData, setFormData] = useState({});
   const [resetTrigger, setResetTrigger] = useState(0);
   const [editingIndex, setEditingIndex] = useState(null);

  const addItem = (item) => {
    setItems((prev) => [...prev, item]);
  };

  const updateFormData = (type, data) => {
    setFormData((prev) => ({ ...prev, [type]: data }));
  };

  const handleSubmitRetreatCard = () => {
    if (Object.keys(formData).length === 0) {
      alert('Please fill out at least one form before submitting.');
      return;
    }
    
    const combinedRetreatItem = {
      type: 'retreat',
      active: true,
      title: formData.PilgrimRetreatCard?.title || 'Retreat',
      image: formData.PilgrimRetreatCard?.image || '',
      link: formData.PilgrimRetreatCard?.link || '',
      ...formData
    };

    if (editingIndex !== null) {
      // We are editing an existing item
      const newItems = [...items];
      newItems[editingIndex] = combinedRetreatItem;
      setItems(newItems);
      setEditingIndex(null);
    } else {
      // We are adding a new item
      addItem(combinedRetreatItem);
    }
    
    // Reset form data
    setFormData({});
    // Increment reset trigger to cause all forms to reset
    setResetTrigger(prev => prev + 1);
    
    alert(editingIndex !== null ? 'Retreat card updated successfully!' : 'Retreat card added successfully!');
  };

  const editItem = (index) => {
    // Set current item data to form
    setFormData(items[index]);
    setEditingIndex(index);
    
    // Scroll to top of the page to edit the form
    window.scrollTo(0, 0);
  };

  const deleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const toggleItem = (index) => {
    const newItems = [...items];
    newItems[index].active = !newItems[index].active;
    setItems(newItems);
  };

  const moveItem = (from, to) => {
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setItems(updated);
  };
  return(
    <>
      <PilgrimRetreatCard onUpdateData={(data) => updateFormData('PilgrimRetreatCard', data)} resetTrigger={resetTrigger} />
      <MonthlySubscription onUpdateData={(data) => updateFormData('MonthlySubscription', data)} resetTrigger={resetTrigger} />
      <OneTimePurchase onUpdateData={(data) => updateFormData('OneTimePurchase', data)} resetTrigger={resetTrigger} />
      <SessionForm onUpdateData={(data) => updateFormData('SessionForm', data)} resetTrigger={resetTrigger} />
      <FeatureForm onUpdateData={(data) => updateFormData('FeatureForm', data)} resetTrigger={resetTrigger} />
      <Location onUpdateData={(data) => updateFormData('Location', data)} resetTrigger={resetTrigger} />
      <ProgramScheduleForm onUpdateData={(data) => updateFormData('ProgramScheduleForm', data)} resetTrigger={resetTrigger} />
      <RetreatDescription onUpdateData={(data) => updateFormData('RetreatDescription', data)} resetTrigger={resetTrigger} />
      <FAQForm onUpdateData={(data) => updateFormData('FAQForm', data)} resetTrigger={resetTrigger} />
      <MeetGuideForm onUpdateData={(data) => updateFormData('MeetGuideForm', data)} resetTrigger={resetTrigger} />

      <div className="p-8 text-center">
        <button
          onClick={handleSubmitRetreatCard}
          className="bg-[#2F6288] text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-[#224b66] transition-colors"
        >
          {editingIndex !== null ? 'Update Retreat Card' : 'Add Retreat Card'}
        </button>
      </div>

      <div className="p-8">
      <h3 className="text-lg font-bold mt-6 mb-3">Current Retreat Items</h3>
      <DndProvider backend={HTML5Backend}>
        {items.map((item, index) => (
          <SlideItem
            key={index}
            index={index}
            slide={item}
            moveSlide={moveItem}
            onEdit={(i) => editItem(i, item)}
            onDelete={deleteItem}
            onToggle={toggleItem}
          />
        ))}
      </DndProvider>
      </div>
    </>
  )
}
