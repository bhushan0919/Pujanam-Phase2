import React, { useState, useEffect } from "react";
import { panditApi } from "../api/panditApi";
import { analytics } from '../utils/analytics';
import BookingForm from '../components/common/BookingForm';
import { useLanguage } from '../context/LanguageContext';
import Skeleton from '../components/common/Skeleton';

export default function FindPandit() {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pandits, setPandits] = useState([]);
    const [locations, setLocations] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPandit, setSelectedPandit] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        loadFilterOptions();
        loadPandits();
    }, []);

    useEffect(() => {
        loadPandits();
    }, [search, locationFilter, serviceFilter, page]);

    const openBooking = (pandit) => {
        setSelectedPandit(pandit);
        setShowBookingModal(true);
    };

    const closeBooking = () => {
        setShowBookingModal(false);
        setSelectedPandit(null);
    };

    const loadFilterOptions = async () => {
        try {
            const data = await panditApi.getFilterOptions();
            setLocations(data.locations || []);
            setServices(data.services || []);
        } catch (err) {
            // Filter options failed silently; filters will just be empty
        }
    };

    const loadPandits = async () => {
        analytics.trackSearch(search, {
            location: locationFilter,
            service: serviceFilter,
            page: page
        });
        setLoading(true);
        setError("");

        try {
            const filters = {
                search,
                location: locationFilter,
                service: serviceFilter,
                page,
                limit: 6
            };

            const data = await panditApi.getAllPandits(filters);
            setPandits(data.pandits || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setPandits([]);
            setError("Unable to load pandits. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const maskContact = (number) => {
        if (!number) return "**********";
        return number.replace(/.(?=.{4})/g, "*");
    };

    const userIsLoggedIn = !!localStorage.getItem("userToken");

    if (loading) {
        return (
            <div className="px-4 py-8 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">{t('findPanditTitle')}</h1>
                <Skeleton.FilterBar />
                <Skeleton.PanditsGrid count={6} />
                <Skeleton.Pagination />
            </div>
        );
    }

    return (
        <div className="px-4 py-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('findPanditTitle')}</h1>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-white text-sm">
                    <option value="">{t('allLocations')}</option>
                    {locations.map((loc, idx) => (
                        <option key={idx} value={loc}>{loc}</option>
                    ))}
                </select>
                <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-white text-sm">
                    <option value="">{t('allServices')}</option>
                    {services.map((srv, idx) => (
                        <option key={idx} value={srv}>{srv}</option>
                    ))}
                </select>
            </div>

            {/* Error State */}
            {error && (
                <div className="text-center p-12 bg-white rounded-2xl shadow-sm">
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
                    <h3 className="text-xl font-semibold text-gray-700">No Pandits Found</h3>
                    <p className="text-gray-500 mt-2 mb-6">{error}</p>
                    <button
                        onClick={loadPandits}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
                    >
                        🔄 Try Again
                    </button>
                </div>
            )}

            {/* Pandit Cards */}
            {!error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pandits.map(pandit => (
                        <div key={pandit._id || pandit.id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col h-full">
                            <img
                                src={pandit.image}
                                alt={pandit.name}
                                onError={(e) => { e.target.src = '/icon.png'; }}
                                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-white shadow-sm"
                            />
                            <h3 className="text-lg font-semibold text-center mb-1">{pandit.name}</h3>
                            <p className="text-sm text-amber-600 text-center mb-2">{Array.isArray(pandit.services) ? pandit.services.join(", ") : pandit.services}</p>
                            <p className="text-sm text-gray-600"><strong>{t('locationLabel')}:</strong> {pandit.location}</p>
                            <p className="text-sm text-gray-600"><strong>{t('ratingLabel')}:</strong> {pandit.rating} ⭐</p>
                            <p className="text-sm text-gray-600"><strong>{t('experienceLabel')}:</strong> {pandit.experience || 'N/A'} years</p>
                            <p className="text-sm text-gray-600 mt-2"><strong>{t('contactLabel')}:</strong> {userIsLoggedIn ? pandit.contact : maskContact(pandit.contact)}</p>

                            <div className="mt-auto pt-4">
                                <button
                                    className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:shadow-md transition"
                                    onClick={() => openBooking(pandit)}
                                >
                                    {t('bookPanditNow')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && pandits.length === 0 && (
                <div className="text-center p-12 bg-white rounded-2xl shadow-sm">
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🙏</div>
                    <h3 className="text-xl font-semibold">{t('noPanditsFound')}</h3>
                    <p className="text-gray-600 mt-2">{t('adjustFilters')}</p>
                    <button
                        onClick={loadPandits}
                        className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
                    >
                        🔄 Retry
                    </button>
                </div>
            )}

            {/* Pagination */}
            {pandits.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button onClick={handlePrevPage} disabled={page === 1} className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50">
                        ← Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button onClick={handleNextPage} disabled={page >= totalPages} className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50">
                        Next →
                    </button>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedPandit && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeBooking}>
                    <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end">
                            <button className="text-gray-500 hover:text-gray-800" onClick={closeBooking}>✖</button>
                        </div>
                        <BookingForm
                            service={null}
                            pandit={selectedPandit}
                            onClose={closeBooking}
                            onSuccess={() => {
                                closeBooking();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
