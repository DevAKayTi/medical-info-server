import { Partner, IPartner } from '../../database/models/Partner.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class PartnerRepository extends BaseRepository<IPartner> {
  constructor() { super(Partner); }

  async findActive(query: { page?: number; limit?: number }) {
    return this.findAll({ status: 'active', deletedAt: null } as never, {
      page: query.page,
      limit: query.limit,
      sort: { order: 1, name: 1 },
    });
  }
}

export const partnerRepository = new PartnerRepository();
