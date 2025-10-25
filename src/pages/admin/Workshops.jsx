import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import WorkshopForm from "../../components/admin/workshops/WorkshopForm";
import WorkshopItem from "../../components/admin/workshops/WorkshopItem";
import WorkshopBookingTable from "../../components/admin/workshops/WorkshopBookingTable";
import {
    setWorkshops,
    setCurrentWorkshop,
    deleteWorkshop as deleteWorkshopAction,
    setLoading
} from "../../features/workshopsSlice";
import {
    updateWorkshop as updateWorkshopService,
    deleteWorkshop as deleteWorkshopService,
    getWorkshops
} from "../../services/workshopService";
import { showSuccess, showError } from "../../utils/toast";

export default function Workshops() {
    const dispatch = useDispatch();
    const { workshops, loading } = useSelector((state) => state.workshops);

    // Fetch workshops on component mount
    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                dispatch(setLoading(true));
                const fetchedWorkshops = await getWorkshops();
                dispatch(setWorkshops(fetchedWorkshops));
            } catch (error) {
                console.error("Error fetching workshops:", error);
                showError("Failed to load workshops");
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchWorkshops();
    }, [dispatch]);

    // Move workshop items (drag and drop)
    const moveItem = useCallback((dragIndex, hoverIndex) => {
        const draggedItem = workshops[dragIndex];
        const updatedItems = [...workshops];
        updatedItems.splice(dragIndex, 1);
        updatedItems.splice(hoverIndex, 0, draggedItem);
        dispatch(setWorkshops(updatedItems));
    }, [workshops, dispatch]);

    // Edit workshop
    const editItem = useCallback((index) => {
        const workshop = workshops[index];
        dispatch(setCurrentWorkshop(workshop));
    }, [workshops, dispatch]);

    // Delete workshop
    const deleteItem = useCallback(async (index) => {
        if (window.confirm("Are you sure you want to delete this workshop?")) {
            try {
                const workshop = workshops[index];
                if (workshop.id) {
                    await deleteWorkshopService(workshop.id);
                    dispatch(deleteWorkshopAction(workshop.id));
                } else {
                    // If no ID, just remove from local state
                    const updatedWorkshops = workshops.filter((_, i) => i !== index);
                    dispatch(setWorkshops(updatedWorkshops));
                }
                showSuccess("Workshop deleted successfully!");
            } catch (error) {
                console.error("Error deleting workshop:", error);
                showError("Failed to delete workshop");
            }
        }
    }, [workshops, dispatch]);

    // Toggle workshop active/inactive status
    const toggleItem = useCallback(async (index) => {
        try {
            const workshop = workshops[index];
            const updatedWorkshop = {
                ...workshop,
                active: workshop.active !== false ? false : true
            };

            if (workshop.id) {
                await updateWorkshopService(workshop.id, updatedWorkshop);
            }

            const updatedWorkshops = [...workshops];
            updatedWorkshops[index] = updatedWorkshop;
            dispatch(setWorkshops(updatedWorkshops));

            showSuccess(`Workshop ${updatedWorkshop.active ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            console.error("Error toggling workshop status:", error);
            showError("Failed to update workshop status");
        }
    }, [workshops, dispatch]);

    return (
        <div>
            {/* Workshop Form */}
            <WorkshopForm />

            {/* Current Workshops */}
            <div className="p-8">
                <h3 className="text-lg font-bold mt-6 mb-3">Current Workshop Items</h3>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading workshops...</span>
                    </div>
                ) : workshops && workshops.length > 0 ? (
                    <DndProvider backend={HTML5Backend}>
                        {workshops.map((item, index) => (
                            <WorkshopItem
                                key={index}
                                index={index}
                                slide={item}
                                moveSlide={moveItem}
                                onEdit={(i) => editItem(i)}
                                onDelete={deleteItem}
                                onToggle={toggleItem}
                            />
                        ))}
                    </DndProvider>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No workshops found. Create your first workshop using the form above.</p>
                    </div>
                )}
            </div>

            {/* Workshop Bookings Table */}
            <WorkshopBookingTable />
        </div>
    );
}
