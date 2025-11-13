import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { showSuccess, showError } from '../../../utils/toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { useSortable, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X, Eye, EyeOff } from 'lucide-react';
import { fetchAllEvents } from '../../../utils/fetchEvents';
import { useDispatch } from 'react-redux';

import OptimizedImage from '../../../components/ui/OptimizedImage';
const UpcomingEvents = () => {
    const [allPrograms, setAllPrograms] = useState([]);
    const [selectedPrograms, setSelectedPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAllPrograms, setShowAllPrograms] = useState(false);
    const dispatch = useDispatch();

    // Fetch all available programs from different collections
    useEffect(() => {
        const loadAllPrograms = async () => {
            try {
                setLoading(true);
                const events = await fetchAllEvents(dispatch);
                
                // Convert events object to array with proper structure
                const programsArray = Object.entries(events).map(([id, eventData]) => ({
                    id,
                    title: eventData?.upcomingSessionCard?.title || 'Untitled Program',
                    image: eventData?.upcomingSessionCard?.image || '',
                    category: eventData?.upcomingSessionCard?.category || 'Other',
                    price: eventData?.upcomingSessionCard?.price || '0',
                    location: eventData?.upcomingSessionCard?.location || '',
                    type: eventData?.type || 'unknown',
                    data: eventData
                })).filter(program => program.image && program.title !== 'Untitled Program');
                
                setAllPrograms(programsArray);
            } catch (error) {
                console.error('Error loading programs:', error);
                showError('Failed to load programs');
            } finally {
                setLoading(false);
            }
        };

        loadAllPrograms();
    }, [dispatch]);

    // Load selected programs from Firebase
    useEffect(() => {
        const loadSelectedPrograms = async () => {
            try {
                const docRef = doc(db, 'admin_settings', 'upcoming_events_order');
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSelectedPrograms(data.selectedPrograms || []);
                }
            } catch (error) {
                console.error('Error loading selected programs:', error);
            }
        };

        loadSelectedPrograms();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag end for reordering
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setSelectedPrograms((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Add program to selected list
    const addProgram = (program) => {
        if (!selectedPrograms.find(p => p.id === program.id)) {
            setSelectedPrograms([...selectedPrograms, { ...program, isVisible: true }]);
        }
    };

    // Remove program from selected list
    const removeProgram = (programId) => {
        setSelectedPrograms(selectedPrograms.filter(p => p.id !== programId));
    };

    // Toggle program visibility
    const toggleVisibility = (programId) => {
        setSelectedPrograms(selectedPrograms.map(p => 
            p.id === programId ? { ...p, isVisible: !p.isVisible } : p
        ));
    };

    // Save selected programs order to Firebase
    const saveOrder = async () => {
        try {
            setSaving(true);
            const docRef = doc(db, 'admin_settings', 'upcoming_events_order');
            await setDoc(docRef, {
                selectedPrograms,
                lastUpdated: new Date().toISOString(),
                updatedBy: 'admin'
            });
            showSuccess('Upcoming events order saved successfully!');
        } catch (error) {
            console.error('Error saving order:', error);
            showError('Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    // Get available programs (not already selected)
    const availablePrograms = allPrograms.filter(program => 
        !selectedPrograms.find(selected => selected.id === program.id)
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading programs...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Upcoming Events</h1>
                <p className="text-gray-600">Select and reorder programs to display in the upcoming events section on the home page.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Programs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Available Programs</h2>
                            <button
                                onClick={() => setShowAllPrograms(!showAllPrograms)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {showAllPrograms ? 'Show Less' : `Show All (${availablePrograms.length})`}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Click to add programs to upcoming events</p>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3 h-full overflow-y-auto">
                            {availablePrograms.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">All programs are already selected</p>
                            ) : (
                                availablePrograms
                                    .slice(0, showAllPrograms ? availablePrograms.length : 5)
                                    .map((program) => (
                                        <div
                                            key={program.id}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                                            onClick={() => addProgram(program)}
                                        >
                                            {program.image?.includes('.mp4') || program.image?.includes('.webm') || program?.image?.includes('.mov') || program?.image?.includes('.webm') ? (
                                                <video
                                                    src={program.image}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                    muted
                                                />
                                            ) : (
                                                <OptimizedImage                                                     src={program.image}
                                                    alt={program.title}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">{program.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {program.category}
                                                    </span>
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                        {program.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <Plus className="w-5 h-5 text-gray-400" />
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Selected Programs (Reorderable) */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Selected Programs</h2>
                            <span className="text-sm text-gray-500">{selectedPrograms.length} selected</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Drag to reorder • Click eye to toggle visibility</p>
                    </div>
                    <div className="p-4">
                        {selectedPrograms.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No programs selected</p>
                                <p className="text-sm text-gray-400 mt-1">Add programs from the left panel</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={selectedPrograms.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3 h-full overflow-y-auto">
                                        {selectedPrograms.map((program) => (
                                            <SortableItem
                                                key={program.id}
                                                program={program}
                                                toggleVisibility={toggleVisibility}
                                                removeProgram={removeProgram}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            {selectedPrograms.length > 0 && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={saveOrder}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            )}
        </div>
    );
};

// Sortable Item Component
const SortableItem = ({ program, toggleVisibility, removeProgram }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: program.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                isDragging
                    ? 'border-blue-300 shadow-lg bg-blue-50 z-10'
                    : program.isVisible
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            {program.image?.endsWith('.mp4') || program.image?.endsWith('.webm') ? (
                <video
                    src={program.image}
                    className="w-12 h-12 object-cover rounded-lg"
                    muted
                />
            ) : (
                <OptimizedImage                     src={program.image}
                    alt={program.title}
                    className="w-12 h-12 object-cover rounded-lg"
                />
            )}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{program.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {program.category}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {program.type}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => toggleVisibility(program.id)}
                    className={`p-1 rounded-full transition-colors ${
                        program.isVisible
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={program.isVisible ? 'Hide from home page' : 'Show on home page'}
                >
                    {program.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => removeProgram(program.id)}
                    className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                    title="Remove from selection"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default UpcomingEvents;