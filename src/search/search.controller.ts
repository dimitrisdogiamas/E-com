import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, SearchFilters } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  async searchProducts(
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const filters: SearchFilters = {
      query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };

    return this.searchService.searchProducts(filters);
  }

  @Get('suggestions')
  async getSearchSuggestions(@Query('q') query: string) {
    return this.searchService.getSearchSuggestions(query || '');
  }
}
