import OrganizerList from "../../components/admin/organizer/OrganizerList";

export default function Organizers() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Organizer Management</h1>
                <p className="text-gray-600 mt-2">View and manage all organizers</p>
            </div>
            <OrganizerList />
        </div>
    );
}
