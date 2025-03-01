import klaviyoPlugin from '../src/index.js';
import { trackEventAction } from '../src/actions/track-event.js';
import { identifyProfileAction } from '../src/actions/identify-profile.js';
import { getListsAction } from '../src/actions/get-lists.js';
import { addProfilesToListAction } from '../src/actions/add-profiles-to-list.js';
import { removeProfileFromListAction } from '../src/actions/remove-profile-from-list.js';
import { getCampaignsAction } from '../src/actions/get-campaigns.js';
import { KlaviyoClient } from '../src/common/client.js';

// Mock axios
jest.mock('axios');

describe('Klaviyo Plugin', () => {
    describe('Plugin Structure', () => {
        it('should have the correct name and description', () => {
            expect(klaviyoPlugin.name).toBe('klaviyo');
            expect(klaviyoPlugin.description).toBe('Email marketing and customer data platform');
        });

        it('should have the correct actions', () => {
            expect(klaviyoPlugin.actions).toContain(trackEventAction);
            expect(klaviyoPlugin.actions).toContain(identifyProfileAction);
            expect(klaviyoPlugin.actions).toContain(getListsAction);
            expect(klaviyoPlugin.actions).toContain(addProfilesToListAction);
            expect(klaviyoPlugin.actions).toContain(removeProfileFromListAction);
            expect(klaviyoPlugin.actions).toContain(getCampaignsAction);
        });

        it('should have authentication configuration', () => {
            expect(klaviyoPlugin.inputSchema.properties).toHaveProperty('apiKey');
            expect(klaviyoPlugin.inputSchema.required).toContain('apiKey');
        });
    });

    describe('Track Event Action', () => {
        it('should have the correct schema', () => {
            expect(trackEventAction.name).toBe('track_event');
            expect(trackEventAction.inputSchema.properties).toHaveProperty('event');
            expect(trackEventAction.inputSchema.properties).toHaveProperty('email');
            expect(trackEventAction.inputSchema.required).toContain('event');
            expect(trackEventAction.inputSchema.required).toContain('email');
        });

        it('should execute successfully', async () => {
            // Mock the client's trackEvent method
            const mockTrackEvent = jest.fn().mockResolvedValue({ success: true });
            jest.spyOn(KlaviyoClient.prototype, 'trackEvent').mockImplementation(mockTrackEvent);

            const input = {
                apiKey: 'test-api-key',
                event: 'Test Event',
                email: 'test@example.com',
                properties: { test: 'value' },
            };

            const result = await trackEventAction.execute(input);
            expect(result.success).toBe(true);
            expect(mockTrackEvent).toHaveBeenCalledWith(expect.objectContaining({
                event: 'Test Event',
                customer_properties: expect.objectContaining({
                    email: 'test@example.com',
                }),
                properties: { test: 'value' },
            }));
        });
    });

    describe('Identify Profile Action', () => {
        it('should have the correct schema', () => {
            expect(identifyProfileAction.name).toBe('identify_profile');
            expect(identifyProfileAction.inputSchema.properties).toHaveProperty('email');
            expect(identifyProfileAction.inputSchema.required).toContain('email');
        });

        it('should execute successfully', async () => {
            // Mock the client's identifyProfile method
            const mockIdentifyProfile = jest.fn().mockResolvedValue({ success: true });
            jest.spyOn(KlaviyoClient.prototype, 'identifyProfile').mockImplementation(mockIdentifyProfile);

            const input = {
                apiKey: 'test-api-key',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
            };

            const result = await identifyProfileAction.execute(input);
            expect(result.success).toBe(true);
            expect(mockIdentifyProfile).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
            }));
        });
    });

    describe('Get Lists Action', () => {
        it('should have the correct schema', () => {
            expect(getListsAction.name).toBe('get_lists');
            expect(getListsAction.inputSchema.properties).toHaveProperty('apiKey');
            expect(getListsAction.inputSchema.required).toContain('apiKey');
        });

        it('should execute successfully', async () => {
            // Mock the client's getLists method
            const mockGetLists = jest.fn().mockResolvedValue({
                success: true,
                data: [
                    {
                        id: 'list1',
                        name: 'Test List',
                        created: '2023-01-01T00:00:00+00:00',
                        updated: '2023-01-01T00:00:00+00:00',
                    },
                ],
            });
            jest.spyOn(KlaviyoClient.prototype, 'getLists').mockImplementation(mockGetLists);

            const input = {
                apiKey: 'test-api-key',
            };

            const result = await getListsAction.execute(input);
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Test List');
        });
    });

    describe('Add Profiles to List Action', () => {
        it('should have the correct schema', () => {
            expect(addProfilesToListAction.name).toBe('add_profiles_to_list');
            expect(addProfilesToListAction.inputSchema.properties).toHaveProperty('listId');
            expect(addProfilesToListAction.inputSchema.properties).toHaveProperty('profiles');
            expect(addProfilesToListAction.inputSchema.required).toContain('listId');
            expect(addProfilesToListAction.inputSchema.required).toContain('profiles');
        });

        it('should execute successfully', async () => {
            // Mock the client's addProfilesToList method
            const mockAddProfilesToList = jest.fn().mockResolvedValue({ success: true });
            jest.spyOn(KlaviyoClient.prototype, 'addProfilesToList').mockImplementation(mockAddProfilesToList);

            const input = {
                apiKey: 'test-api-key',
                listId: 'list1',
                profiles: [
                    {
                        email: 'test1@example.com',
                        firstName: 'Test1',
                        lastName: 'User1',
                    },
                    {
                        email: 'test2@example.com',
                        firstName: 'Test2',
                        lastName: 'User2',
                    },
                ],
            };

            const result = await addProfilesToListAction.execute(input);
            expect(result.success).toBe(true);
            expect(mockAddProfilesToList).toHaveBeenCalledWith('list1', expect.arrayContaining([
                expect.objectContaining({
                    email: 'test1@example.com',
                    first_name: 'Test1',
                    last_name: 'User1',
                }),
                expect.objectContaining({
                    email: 'test2@example.com',
                    first_name: 'Test2',
                    last_name: 'User2',
                }),
            ]));
        });
    });

    describe('Remove Profile from List Action', () => {
        it('should have the correct schema', () => {
            expect(removeProfileFromListAction.name).toBe('remove_profile_from_list');
            expect(removeProfileFromListAction.inputSchema.properties).toHaveProperty('listId');
            expect(removeProfileFromListAction.inputSchema.properties).toHaveProperty('email');
            expect(removeProfileFromListAction.inputSchema.required).toContain('listId');
            expect(removeProfileFromListAction.inputSchema.required).toContain('email');
        });

        it('should execute successfully', async () => {
            // Mock the client's removeProfileFromList method
            const mockRemoveProfileFromList = jest.fn().mockResolvedValue({ success: true });
            jest.spyOn(KlaviyoClient.prototype, 'removeProfileFromList').mockImplementation(mockRemoveProfileFromList);

            const input = {
                apiKey: 'test-api-key',
                listId: 'list1',
                email: 'test@example.com',
            };

            const result = await removeProfileFromListAction.execute(input);
            expect(result.success).toBe(true);
            expect(mockRemoveProfileFromList).toHaveBeenCalledWith('list1', 'test@example.com');
        });
    });

    describe('Get Campaigns Action', () => {
        it('should have the correct schema', () => {
            expect(getCampaignsAction.name).toBe('get_campaigns');
            expect(getCampaignsAction.inputSchema.properties).toHaveProperty('apiKey');
            expect(getCampaignsAction.inputSchema.required).toContain('apiKey');
        });

        it('should execute successfully', async () => {
            // Mock the client's getCampaigns method
            const mockGetCampaigns = jest.fn().mockResolvedValue({
                success: true,
                data: [
                    {
                        id: 'campaign1',
                        name: 'Test Campaign',
                        subject: 'Test Subject',
                        from_email: 'test@example.com',
                        from_name: 'Test Sender',
                        status: 'sent',
                        created: '2023-01-01T00:00:00+00:00',
                        updated: '2023-01-01T00:00:00+00:00',
                    },
                ],
            });
            jest.spyOn(KlaviyoClient.prototype, 'getCampaigns').mockImplementation(mockGetCampaigns);

            const input = {
                apiKey: 'test-api-key',
            };

            const result = await getCampaignsAction.execute(input);
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Test Campaign');
        });
    });
});
