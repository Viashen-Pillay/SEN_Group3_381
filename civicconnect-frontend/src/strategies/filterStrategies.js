export const CategoryFilterStrategy = {
  filter: (requests, category) => {
    if (!category || category === 'ALL') return requests;
    return requests.filter(req => req.categoryId === category);
  }
};

export const StatusFilterStrategy = {
  filter: (requests, status) => {
    if (!status || status === 'ALL') return requests;
    return requests.filter(req => req.status === status);
  }
};

export const KeywordSearchStrategy = {
  filter: (requests, keyword) => {
    if (!keyword) return requests;
    const lower = keyword.toLowerCase();
    return requests.filter(req => 
      req.description.toLowerCase().includes(lower)
    );
  }
};