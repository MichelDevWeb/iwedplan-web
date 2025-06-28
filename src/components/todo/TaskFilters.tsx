"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CheckCheck, Tag, User, ChevronDown } from "lucide-react";

export interface FilterOptions {
  status: string;
  category: string;
  assignedTo: string;
  timeframe?: string;
}

interface TaskFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  filterOptions: FilterOptions;
  isMobileView?: boolean;
}

const TaskFilters = ({ onFilterChange, filterOptions, isMobileView = false }: TaskFiltersProps) => {
  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filterOptions, status });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filterOptions, category });
  };

  const handleAssigneeChange = (assignedTo: string) => {
    onFilterChange({ ...filterOptions, assignedTo });
  };

  return (
    <div className={`${isMobileView ? 'flex gap-2 justify-center' : 'flex flex-wrap gap-2 items-center'}`}>
      {/* Status filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={isMobileView ? "sm" : "sm"} 
            className={`${isMobileView ? 'w-10 h-10 p-0' : 'h-9'} border-pink-200 hover:bg-pink-50`}
          >
            <CheckCheck className="h-4 w-4" />
            {!isMobileView && (
              <>
                <span className="ml-2">Trạng thái</span>
                <ChevronDown className="h-3 w-3 ml-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleStatusChange('all')}
            className={filterOptions.status === 'all' ? 'bg-pink-50' : ''}
          >
            Tất cả trạng thái
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusChange('pending')}
            className={filterOptions.status === 'pending' ? 'bg-pink-50' : ''}
          >
            Chưa bắt đầu
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusChange('in-progress')}
            className={filterOptions.status === 'in-progress' ? 'bg-pink-50' : ''}
          >
            Đang thực hiện
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusChange('completed')}
            className={filterOptions.status === 'completed' ? 'bg-pink-50' : ''}
          >
            Hoàn thành
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Category filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={isMobileView ? "sm" : "sm"} 
            className={`${isMobileView ? 'w-10 h-10 p-0' : 'h-9'} border-pink-200 hover:bg-pink-50`}
          >
            <Tag className="h-4 w-4" />
            {!isMobileView && (
              <>
                <span className="ml-2">Danh mục</span>
                <ChevronDown className="h-3 w-3 ml-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('all')}
            className={filterOptions.category === 'all' ? 'bg-pink-50' : ''}
          >
            Tất cả danh mục
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('venue')}
            className={filterOptions.category === 'venue' ? 'bg-pink-50' : ''}
          >
            Địa điểm
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('attire')}
            className={filterOptions.category === 'attire' ? 'bg-pink-50' : ''}
          >
            Trang phục
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('decoration')}
            className={filterOptions.category === 'decoration' ? 'bg-pink-50' : ''}
          >
            Trang trí
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('photography')}
            className={filterOptions.category === 'photography' ? 'bg-pink-50' : ''}
          >
            Chụp ảnh
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('catering')}
            className={filterOptions.category === 'catering' ? 'bg-pink-50' : ''}
          >
            Ẩm thực
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('guest')}
            className={filterOptions.category === 'guest' ? 'bg-pink-50' : ''}
          >
            Khách mời
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleCategoryChange('other')}
            className={filterOptions.category === 'other' ? 'bg-pink-50' : ''}
          >
            Khác
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assignee filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={isMobileView ? "sm" : "sm"} 
            className={`${isMobileView ? 'w-10 h-10 p-0' : 'h-9'} border-pink-200 hover:bg-pink-50`}
          >
            <User className="h-4 w-4" />
            {!isMobileView && (
              <>
                <span className="ml-2">Người thực hiện</span>
                <ChevronDown className="h-3 w-3 ml-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleAssigneeChange('all')}
            className={filterOptions.assignedTo === 'all' ? 'bg-pink-50' : ''}
          >
            Tất cả
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAssigneeChange('bride')}
            className={filterOptions.assignedTo === 'bride' ? 'bg-pink-50' : ''}
          >
            Cô dâu
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAssigneeChange('groom')}
            className={filterOptions.assignedTo === 'groom' ? 'bg-pink-50' : ''}
          >
            Chú rể
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAssigneeChange('both')}
            className={filterOptions.assignedTo === 'both' ? 'bg-pink-50' : ''}
          >
            Cả hai
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAssigneeChange('family')}
            className={filterOptions.assignedTo === 'family' ? 'bg-pink-50' : ''}
          >
            Gia đình
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAssigneeChange('friend')}
            className={filterOptions.assignedTo === 'friend' ? 'bg-pink-50' : ''}
          >
            Bạn bè
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskFilters; 