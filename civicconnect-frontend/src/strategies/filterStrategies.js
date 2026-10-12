export const CategoryFilterStrategy = {
  filter: (requests, category) => {
    if (!category || category === 'ALL') return requests;
    return requests.filter((req) => String(req.category_id) === String(category));
  }
};

export const StatusFilterStrategy = {
  filter: (requests, status) => {
    if (!status || status === 'ALL') return requests;
    return requests.filter((req) => req.status === status);
  }
};

export const KeywordSearchStrategy = {
  filter: (requests, keyword) => {
    if (!keyword?.trim()) return requests;

    const search = keyword.toLowerCase();

    return requests.filter((req) =>
      `${req.title ?? ""} ${req.description ?? ""}`
        .toLowerCase()
        .includes(search)
    );
  }
};